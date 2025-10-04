#!/usr/bin/env python3
"""
Scrape high-resolution poster images from a Deadline gallery and skip small/irrelevant images.

Usage:
  python crawl_deadline.py --url "https://deadline.com/gallery/taylor-swift-life-of-a-showgirl-album-covers-photos/swift-showgirl-b/" --out "posters_eras" --min-width 800 --min-kb 40

Notes:
  - Follows the gallery's next/prev slides (rel=next) to capture all images.
  - Chooses the highest-resolution URL from srcset when available.
  - Skips images smaller than min_width (by srcset descriptor when available) and
    optionally skips by content-length < min_kb (via HEAD).
  - Deduplicates by final URL.
"""

from __future__ import annotations

import argparse
import os
import re
import sys
from typing import Iterable, List, Optional, Set, Tuple
from urllib.parse import urlparse, urljoin, urlsplit, urlunsplit

import requests
from bs4 import BeautifulSoup


DEFAULT_URL = "https://deadline.com/gallery/taylor-swift-life-of-a-showgirl-album-covers-photos/swift-showgirl-b/"


def ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def clean_url(u: str) -> str:
    """Remove query/fragment to normalize filenames."""
    parts = list(urlsplit(u))
    parts[3] = ""  # query
    parts[4] = ""  # fragment
    return urlunsplit(parts)


def pick_largest_from_srcset(srcset: str) -> Tuple[str, Optional[int]]:
    """Given a srcset string, pick the URL with the largest width descriptor.

    Returns (url, width) where width may be None if not parseable.
    """
    best_url = None
    best_w = -1
    # srcset entries: "url 320w, url 640w, url 1024w"
    for part in srcset.split(","):
        item = part.strip()
        if not item:
            continue
        tokens = item.split()
        url = tokens[0]
        width = None
        if len(tokens) > 1:
            m = re.match(r"(\d+)w", tokens[1].strip())
            if m:
                width = int(m.group(1))
        if width is None:
            # Sometimes x-descriptor (e.g., 2x); prefer to keep as fallback
            # but we can't compare fairly; treat as 0
            width_val = 0
        else:
            width_val = width
        if width_val > best_w:
            best_w = width_val
            best_url = url
    return best_url or "", (best_w if best_w >= 0 else None)


def extract_image_candidates(soup: BeautifulSoup, base_url: str) -> List[Tuple[str, Optional[int]]]:
    candidates: List[Tuple[str, Optional[int]]] = []

    # 1) Prefer images inside article/gallery content
    #    Collect all <img> and use srcset if present
    for img in soup.find_all("img"):
        srcset = img.get("srcset") or img.get("data-srcset")
        src = img.get("src") or img.get("data-src")
        chosen_url = None
        width_hint: Optional[int] = None

        if srcset:
            u, w = pick_largest_from_srcset(srcset)
            if u:
                chosen_url = u
                width_hint = w
        if not chosen_url and src:
            chosen_url = src
            # try width attr as hint
            w_attr = img.get("width")
            try:
                width_hint = int(w_attr) if w_attr else None
            except Exception:
                width_hint = None

        if chosen_url:
            # resolve relative URLs
            chosen_url = urljoin(base_url, chosen_url)
            candidates.append((chosen_url, width_hint))

    # 2) og:image as fallback
    og = soup.find("meta", attrs={"property": "og:image"})
    if og and og.get("content"):
        candidates.append((urljoin(base_url, og["content"]), None))

    return candidates


def is_probably_small(url: str, width_hint: Optional[int], min_width: int) -> bool:
    # Filter by extension
    if not re.search(r"\.(jpe?g|png|webp)$", url.split("?")[0], re.IGNORECASE):
        return True
    # Common junk patterns
    junk_patterns = ["sprite", "icon", "favicon", "logo", "avatar", "/ads/", "google-analytics"]
    if any(p in url.lower() for p in junk_patterns):
        return True
    # If we have a width hint and it's below threshold
    if width_hint is not None and width_hint < min_width:
        return True
    return False


def head_content_length(url: str, timeout: int = 10) -> Optional[int]:
    try:
        r = requests.head(url, timeout=timeout, allow_redirects=True)
        if "content-length" in r.headers:
            return int(r.headers["content-length"])  # may raise ValueError if malformed
    except Exception:
        return None
    return None


def unique_preserve_order(items: Iterable[str]) -> List[str]:
    seen: Set[str] = set()
    out: List[str] = []
    for x in items:
        if x not in seen:
            seen.add(x)
            out.append(x)
    return out


def find_next_url(soup: BeautifulSoup, base_url: str) -> Optional[str]:
    # Try <link rel="next"> first
    link = soup.find("link", rel="next")
    if link and link.get("href"):
        return urljoin(base_url, link["href"])
    # Try <a rel="next">
    a = soup.find("a", rel="next")
    if a and a.get("href"):
        return urljoin(base_url, a["href"])
    # Try next buttons by aria-label
    a2 = soup.find("a", attrs={"aria-label": re.compile(r"next", re.I)})
    if a2 and a2.get("href"):
        return urljoin(base_url, a2["href"])
    return None


def crawl_gallery(start_url: str, max_pages: int = 200) -> List[Tuple[str, Optional[int]]]:
    urls: List[Tuple[str, Optional[int]]] = []
    visited: Set[str] = set()
    current = start_url
    for _ in range(max_pages):
        if not current or current in visited:
            break
        visited.add(current)
        print(f"Fetching: {current}")
        try:
            resp = requests.get(current, timeout=20)
            resp.raise_for_status()
        except Exception as e:
            print(f"Failed to fetch {current}: {e}")
            break
        soup = BeautifulSoup(resp.text, "html.parser")
        urls.extend(extract_image_candidates(soup, current))
        nxt = find_next_url(soup, current)
        if not nxt:
            break
        current = nxt
    return urls


def download_images(urls_with_hint: List[Tuple[str, Optional[int]]], out_dir: str, min_width: int, min_kb: int) -> None:
    ensure_dir(out_dir)

    # Filter candidates
    filtered: List[Tuple[str, Optional[int]]] = []
    for url, w in urls_with_hint:
        url = clean_url(url)
        if is_probably_small(url, w, min_width):
            continue
        filtered.append((url, w))

    # Deduplicate by URL
    filtered_unique = unique_preserve_order([u for u, _ in filtered])
    print(f"Found {len(filtered_unique)} candidate images after filtering.")

    # Optional HEAD filter by size
    final_urls: List[str] = []
    for u in filtered_unique:
        cl = head_content_length(u)
        if cl is not None and cl < (min_kb * 1024):
            print(f"Skip (too small by size {cl}B): {u}")
            continue
        final_urls.append(u)

    print(f"Downloading {len(final_urls)} images...")
    for idx, u in enumerate(final_urls, start=1):
        try:
            r = requests.get(u, timeout=30)
            r.raise_for_status()
        except Exception as e:
            print(f"Failed to download {u}: {e}")
            continue

        # filename from URL path
        path = urlparse(u).path
        fname = os.path.basename(path) or f"image_{idx}.jpg"
        # ensure extension
        if not re.search(r"\.(jpe?g|png|webp)$", fname, re.IGNORECASE):
            fname = f"{fname}.jpg"

        out_path = os.path.join(out_dir, fname)
        # handle collisions
        base, ext = os.path.splitext(out_path)
        c = 1
        while os.path.exists(out_path):
            out_path = f"{base}_{c}{ext}"
            c += 1

        with open(out_path, "wb") as f:
            f.write(r.content)
        print(f"Saved: {out_path}")


def main(argv: Optional[List[str]] = None) -> int:
    p = argparse.ArgumentParser(description="Scrape high-res images from a Deadline gallery")
    p.add_argument("--url", default=DEFAULT_URL, help="Starting gallery URL (a slide URL is fine)")
    p.add_argument("--out", default="album_covers/deadline_showgirl", help="Output directory")
    p.add_argument("--min-width", type=int, default=200, help="Minimum width (by srcset hint) to accept")
    p.add_argument("--min-kb", type=int, default=40, help="Minimum file size (KB) by HEAD content-length")
    args = p.parse_args(argv)

    urls_with_hint = crawl_gallery(args.url)
    download_images(urls_with_hint, args.out, args.min_width, args.min_kb)
    print("Done.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

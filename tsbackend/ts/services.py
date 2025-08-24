from __future__ import annotations

import random
from dataclasses import dataclass
from typing import Iterable, List, Optional, Tuple

from django.db import transaction
from django.db.models import F
from django.utils import timezone

from ts.models import (
    GameSession,
    GameTurn,
    GameSessionStatus,
    GameTurnOutcome,
    Song,
    SongTitle,
)
from .exceptions import (
    VersionConflict,
    InvalidState,
    TurnNotCurrent,
    OptionInvalid,
    TurnAlreadyAnswered,
)


def pick_song() -> Song:
    qs = Song.objects.all()
    count = qs.count()
    offset = random.randint(0, max(0, count - 1))
    song = qs[offset]
    return song


def build_options(correct_title: str, k: int = 3) -> List[str]:
    titles = list(
        SongTitle.objects.exclude(title=correct_title)
        .values_list("title", flat=True)
        .order_by("?")[:k]
    )
    titles.append(correct_title)
    random.shuffle(titles)
    return titles


def _create_turn(session: GameSession, sequence_index: int) -> GameTurn:
    song = pick_song()
    if session.score >= 35:
        time_limit_sec = 7
    elif session.score >= 20:
        time_limit_sec = 10
    elif session.score >= 10:
        time_limit_sec = 15
    else:
        time_limit_sec = 20

    return GameTurn.objects.create(
        session=session,
        sequence_index=sequence_index,
        song=song,
        options=build_options(song.song_title.title),
        correct_option=song.song_title.title,
        selected_option=None,
        snippet_start_sec=0,
        time_limit_secs=time_limit_sec,
    )


@transaction.atomic
def start_session(user) -> GameSession:
    session = GameSession.objects.create(
        user=user,
        status=GameSessionStatus.IN_PROGRESS,
        score=0,
    )
    first_turn = _create_turn(session, sequence_index=1)
    session.current_turn = first_turn
    session.save(update_fields=["current_turn"])
    return session


@transaction.atomic
def submit_guess(session_id: int, option: str, elapsed_time_ms: int, version: int):
    session = (
        GameSession.objects.select_for_update()
        .select_related("current_turn")
        .get(id=session_id)
    )

    if version != session.version:
        raise VersionConflict(
            f"Stale version received: {version}, expected: {session.version}"
        )

    if session.status != GameSessionStatus.IN_PROGRESS:
        raise InvalidState(f"Session is not in progress: {session.status}")

    turn: GameTurn = session.current_turn

    if turn.outcome != GameTurnOutcome.PENDING:
        raise TurnAlreadyAnswered(f"Turn already answered. state {turn.outcome}")

    now = timezone.now()
    if elapsed_time_ms > turn.time_limit_secs * 1000:
        outcome = GameTurnOutcome.TIMEOUT
    elif option == turn.correct_option:
        outcome = GameTurnOutcome.CORRECT
    else:
        outcome = GameTurnOutcome.WRONG

    turn.selected_option = option
    turn.outcome = outcome
    turn.answered_at = now
    turn.save(update_fields=["selected_option", "outcome", "answered_at"])

    if outcome == GameTurnOutcome.CORRECT:
        session.score += 1
        session.status = GameSessionStatus.REVEALING
        poster_url = (
            turn.song.song_title.poster_pics.all().order_by("?").first().image.url
        )
        is_ended = False
    else:
        is_ended = True
        session.status = GameSessionStatus.ENDED
        session.ended_at = now
        poster_url = None

    session.version += 1
    session.save(update_fields=["score", "status", "ended_at", "version"])

    return poster_url, is_ended

@transaction.atomic
def create_next_turn(session_id:int, version:int) -> Tuple[GameSession,GameTurn]:
    session = (
        GameSession.objects.select_for_update()
        .select_related("current_turn")
        .get(id=session_id)
    )

    if version != session.version:
        raise VersionConflict(
            f"Stale version received: {version}, expected: {session.version}"
        )

    if session.status != GameSessionStatus.REVEALING:
        raise InvalidState(f"Session is not in progress: {session.status}")

    next_index = session.current_turn.sequence_index + 1
    new_turn = _create_turn(session, sequence_index=next_index)
    session.current_turn = new_turn
    session.status = GameSessionStatus.IN_PROGRESS
    session.version += 1
    session.save(update_fields=["current_turn", "status", "version"])
    return session,new_turn

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
from core.models import CustomUser as User

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
    print("user",user)
    session = GameSession.objects.create(
        user=user,
        status=GameSessionStatus.IN_PROGRESS,
        score=0,
    )
    print("session",session)
    first_turn = _create_turn(session, sequence_index=1)
    session.current_turn = first_turn
    session.save(update_fields=["current_turn"])
    return session


@transaction.atomic
def submit_guess(session_id: int, option: str, elapsed_time_ms: int, version: int,user:User):
    session = (
        GameSession.objects.select_for_update()
        .select_related("current_turn")
        .get(id=session_id,user=user)
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

    if outcome == GameTurnOutcome.CORRECT:
        session.version += 1
        session.score += 1
        session.status = GameSessionStatus.REVEALING
        poster_url = (
            turn.song.song_title.poster_pics.all().order_by("?").first().image.url
        )
        turn.poster_url = poster_url
    elif session.score == 0:
        turn.outcome = GameTurnOutcome.PENDING
    else:
        session.version += 1
        session.status = GameSessionStatus.ENDED
        session.ended_at = now
        poster_url = None

    turn.save(update_fields=["selected_option", "outcome", "answered_at", "poster_url"])
    session.save(update_fields=["score", "status", "ended_at", "version"])
    return turn, session

@transaction.atomic
def create_next_turn(session_id:int, version:int,user:User) -> Tuple[GameSession,GameTurn]:
    session = (
        GameSession.objects.select_for_update()
        .select_related("current_turn")
        .get(id=session_id,user=user)
    )

    if version != session.version:
        raise VersionConflict(
            f"Stale version received: {version}, expected: {session.version}"
        )

    if session.status != GameSessionStatus.REVEALING:
        raise InvalidState(f"Session is not in reavaling: {session.status}")

    next_index = session.current_turn.sequence_index + 1
    new_turn = _create_turn(session, sequence_index=next_index)
    session.current_turn = new_turn
    session.status = GameSessionStatus.IN_PROGRESS
    session.version += 1
    session.save(update_fields=["current_turn", "status", "version"])
    return session,new_turn

@transaction.atomic
def end_session(session_id:int, version:int,user:User):
    session = GameSession.objects.select_for_update().get(id=session_id,user=user)
    if version != session.version:
        raise VersionConflict(
            f"Stale version received: {version}, expected: {session.version}"
        )
    session.status = GameSessionStatus.ENDED
    session.ended_at = timezone.now()
    session.version += 1

    turn = session.current_turn
    turn.outcome = GameTurnOutcome.TIMEOUT
    session.save(update_fields=["status", "ended_at", "version"])
    turn.save(update_fields=["outcome"])
    return session, turn
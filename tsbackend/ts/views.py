from rest_framework.decorators import action
from rest_framework import viewsets, status
from .services import (
    handle_next,
    end_session,
    start_session,
    submit_guess,
    get_top_score_of_current_week,
)
from .services import get_top_score_of_current_week
from .models import (
    GameSession,
    GameSessionStatus,
    GameTurn,
    GameTurnOutcome,
    GameRoom,
    Song,
    SongTitle,
    Poster,
    Comment,
)
from .serializers import (
    GuessSerializer,
    VersionNumberSerializer,
    SongSerializer,
    SongTitleSerializer,
    PosterSerializer,
    CommentSerializer,
    GameSessionSerlaiizer,
    GameTurnSerializer,
    RoomSerializer,
)
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
import random
from core.serializer import UserSerializer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


class SongViewSet(viewsets.ModelViewSet):
    queryset = Song.objects.all()
    serializer_class = SongSerializer

    def get_queryset(self):
        song_name = self.request.query_params.get("song_name", None)
        query = self.queryset
        if song_name:
            query = query.filter(song_title__title=song_name)
        return query

    @action(detail=False, methods=["get"])
    def random_song(self, request):
        album = request.query_params.get("album", None)
        songs = Song.objects.all()
        if album:
            songs = songs.filter(song_title__album=album)
        if not songs.exists():
            songs = Song.objects.all()

        songs = list(songs)
        random_song = random.choice(songs)
        serializer = self.get_serializer(random_song)
        return Response(serializer.data)


class SongTitleViewSet(viewsets.ModelViewSet):
    queryset = SongTitle.objects.all().prefetch_related("poster_pics")
    serializer_class = SongTitleSerializer


class PosterViewSet(viewsets.ModelViewSet):
    queryset = Poster.objects.all()
    serializer_class = PosterSerializer


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer


@api_view(["GET"])
def rand_titles(request):
    song_titles = list(SongTitle.objects.values_list("title", flat=True))
    random_titles = random.sample(song_titles, 4)
    return Response(random_titles)


class GameSessionViewSet(viewsets.ModelViewSet):
    queryset = GameSession.objects.all()
    serializer_class = GameSessionSerlaiizer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        session = start_session(request.user)
        data = GameSessionSerlaiizer(session).data
        return Response({"session": data}, status=status.HTTP_201_CREATED)

    @action(
        detail=True,
        methods=["POST"],
        permission_classes=[IsAuthenticated],
        url_path="guess",
    )
    def guess(self, request, pk):
        user = request.user
        serializer = GuessSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        session_id = int(pk)
        option = serializer.validated_data["option"]
        version = serializer.validated_data["version"]
        elapsed_time_ms = serializer.validated_data["elapsed_time_ms"]
        turn, session = submit_guess(
            session_id=session_id,
            option=option,
            elapsed_time_ms=elapsed_time_ms,
            version=version,
            user=user,
        )
        payload = {
            "turn": GameTurnSerializer(turn).data,
            "session": GameSessionSerlaiizer(session).data,
        }
        return Response(payload, status=status.HTTP_200_OK)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsAuthenticated],
        url_path="next-turn",
    )
    def next_turn(self, request, pk):
        user = request.user
        serializer = VersionNumberSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        session_id = int(pk)
        version = serializer.validated_data["version"]
        session, new_turn, preloaded_turn = handle_next(
            session_id=session_id, version=version, user=user
        )
        payload = {
            "session": GameSessionSerlaiizer(session).data,
            "new_turn": GameTurnSerializer(new_turn).data,
            "preloaded_turn": GameTurnSerializer(preloaded_turn).data,
        }
        return Response(payload, status=status.HTTP_200_OK)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsAuthenticated],
        url_path="end-session",
    )
    def end_session(self, request, pk):
        user = request.user
        serializer = VersionNumberSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        session_id = int(pk)
        version = serializer.validated_data["version"]
        session, turn = end_session(session_id=session_id, version=version, user=user)
        payload = {
            "session": GameSessionSerlaiizer(session).data,
            "turn": GameTurnSerializer(turn).data,
        }
        return Response(payload, status=status.HTTP_200_OK)

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[IsAuthenticated],
        url_path="previous-results",
    )
    def previous_results(self, request):
        """
        Return finished (previous) game sessions for the authenticated user.
        Each record includes: session_id, score, last_correct_song (serialized Song),
        and end_time if available. Unfinished sessions are excluded.
        Paginated response.
        """
        user = request.user
        qs = (
            GameSession.objects.filter(user=user)
            .filter(status=GameSessionStatus.ENDED)
            .order_by("-ended_at", "id")
        )

        # Get paginated queryset
        page = self.paginate_queryset(qs)
        if page is not None:
            sessions = page
        else:
            sessions = qs

        results = []
        for session in sessions:
            # Get the last turn for this session
            last_turn: GameTurn = (
                session.turns.filter(outcome=GameTurnOutcome.WRONG)
                .order_by("-sequence_index")
                .first()
            )

            result_data = {
                "session_id": session.id,
                "score": session.score,
                "ended_at": session.ended_at,
            }

            # Add last correct song if last turn exists
            if last_turn:
                result_data["last_correct_song"] = SongSerializer(last_turn.song).data
            else:
                result_data["last_correct_song"] = None

            results.append(result_data)

        if page is not None:
            return self.get_paginated_response(results)

        return Response(results)

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[IsAuthenticated],
        url_path="total-played",
    )
    def total_played(self, request):
        """
        Return the total number of games played by the authenticated user.
        Here we consider a "played" game as a finished session (status=ENDED).
        """
        user = request.user
        total = GameSession.objects.filter(
            user=user, status=GameSessionStatus.ENDED
        ).count()
        return Response({"total_played": total})

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[IsAuthenticated],
        url_path="top-week-scores",
    )
    def top_week_scores(self, request):
        items = get_top_score_of_current_week()
        results = [
            {"score": score, "user": UserSerializer(user).data} for score, user in items
        ]
        return Response(results)


class GameTurnViewSet(viewsets.ModelViewSet):
    queryset = GameTurn.objects.all()
    serializer_class = GameTurnSerializer


class RoomViewSet(viewsets.ModelViewSet):
    queryset = GameRoom.objects.all().select_related("player_1", "player_2", "current_song")
    serializer_class = RoomSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        status_param = self.request.query_params.get("status")
        if status_param:
            qs = qs.filter(status=status_param)
        return qs.order_by("-created_at")

    def perform_create(self, serializer):
        # creator is always player_1; ignore any incoming player_1
        serializer.save(player_1=self.request.user)

    def create(self, request, *args, **kwargs):
        # Use DRF's standard flow so we can broadcast after saving
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        # Broadcast to the lobby that a new room is created
        try:
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                "lobby",
                {
                    "type": "broadcast",
                    "message_type": "room_created",
                    "data": serializer.data,
                },
            )
        except Exception:
            # Non-fatal: room is created even if broadcast fails
            pass

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=["post"], url_path="join")
    def join(self, request, pk=None):
        room: Room = self.get_object()
        user = request.user

        if room.player_1_id == user.id or room.player_2_id == user.id:
            # already in the room
            return Response(self.get_serializer(room).data)

        if room.player_2_id is not None:
            return Response({"detail": "Room is full."}, status=status.HTTP_400_BAD_REQUEST)

        room.player_2 = user
        # Transition to IN_GAME when both players present
        from .models import RoomStatus

        if room.status == RoomStatus.WAITING:
            room.status = RoomStatus.IN_GAME
        room.save(update_fields=["player_2", "status", "updated_at"])
        return Response(self.get_serializer(room).data)

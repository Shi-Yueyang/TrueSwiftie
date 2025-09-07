from rest_framework.decorators import action
from rest_framework import viewsets, status
from .services import (
    create_next_turn,
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
)
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
import random
from django.utils import timezone
from datetime import timedelta
from core.serializer import UserSerializer


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
        session, new_turn = create_next_turn(
            session_id=session_id, version=version, user=user
        )
        payload = {
            "session": GameSessionSerlaiizer(session).data,
            "new_turn": GameTurnSerializer(new_turn).data,
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
            last_turn = session.turns.order_by('-sequence_index').first()
            
            result_data = {
                'session_id': session.id,
                'score': session.score,
                'ended_at': session.ended_at,
            }
            
            # Add last correct song if last turn exists
            if last_turn:
                result_data['last_correct_song'] = SongSerializer(last_turn.song).data
            else:
                result_data['last_correct_song'] = None
                
            results.append(result_data)
        
        if page is not None:
            return self.get_paginated_response(results)
        
        return Response(results)

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[IsAuthenticated],
        url_path="top-week-scores",
    )
    def top_week_scores(self, request):
        """
        Return paginated best scores for the current week, ordered by score desc then ended_at desc.
        Query params: page (1-based), page_size.
        Response: { count, page, page_size, results: [{ score, user }] }
        """
        try:
            page = int(request.query_params.get("page", 1))
        except ValueError:
            page = 1
        # Default to paginator page_size if available
        default_ps = getattr(getattr(self, 'paginator', None), 'page_size', 10) or 10
        try:
            page_size = int(request.query_params.get("page_size", default_ps))
        except ValueError:
            page_size = default_ps

        items, total = get_top_score_of_current_week(page=page, page_size=page_size)
        results = [{"score": score, "user": UserSerializer(user).data} for score, user in items]
        payload = {
            "count": total,
            "page": page,
            "page_size": page_size,
            "results": results,
        }
        return Response(payload)

    @action(detail=False, methods=["get"], url_path="top-week-score")
    def top_week_score(self, request):
        """Return the top finished game session score for the current week.

        Response shape: {"score": int, "user": {"id": int, "username": str}}
        If no sessions this week, return 204 No Content.
        """
        res = get_top_score_of_current_week()
        if not res:
            return Response(status=status.HTTP_204_NO_CONTENT)
        score, user = res
        user_data = {"id": user.id}
        # include username if available
        username = getattr(user, "username", None)
        if username:
            user_data["username"] = username
        return Response({"score": score, "user": user_data})





class GameTurnViewSet(viewsets.ModelViewSet):
    queryset = GameTurn.objects.all()
    serializer_class = GameTurnSerializer

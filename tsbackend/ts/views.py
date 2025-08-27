from rest_framework.decorators import action
from rest_framework import viewsets, status

from .services import create_next_turn, end_session, start_session, submit_guess
from .models import GameSession, Song, SongTitle, Poster, GameHistory, Comment
from .serializers import (
    GameHistoryReadSerializer,
    GuessSerializer,
    VersionNumberSerializer,
    SongSerializer,
    SongTitleSerializer,
    PosterSerializer,
    GameHistoryWriteSerializer,
    CommentSerializer,
    GameSessionSerlizer,
    GameTurnSerializer,
)
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
import random
from django.utils import timezone
from datetime import timedelta


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


class GameHistoryViewSet(viewsets.ModelViewSet):
    queryset = GameHistory.objects.all().order_by("-id")
    serializer_class = GameHistoryWriteSerializer

    def get_serializer(self, *args, **kwargs):
        if self.action == "top_scores":
            return GameHistoryReadSerializer(*args, **kwargs)
        return super().get_serializer(*args, **kwargs)

    def get_queryset(self):
        start_time = self.request.query_params.get("start_time", None)
        end_time = self.request.query_params.get("end_time", None)
        user_id = self.request.query_params.get("user_id", None)
        query = self.queryset
        if user_id:
            query = query.filter(score__gt=0)
            query = query.filter(user=user_id)
        if start_time:
            query = query.filter(start_time__gte=start_time)
        if end_time:
            query = query.filter(end_time__lte=end_time)
        return query

    @action(detail=False, methods=["get"], url_path="top-scores")
    def top_scores(self, request):
        now = timezone.now()
        start_of_week = now - timedelta(days=now.weekday() + 1)
        top_scores = GameHistory.objects.filter(start_time__gte=start_of_week).order_by(
            "-score", "pk"
        )
        page = self.paginate_queryset(top_scores)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(top_scores, many=True)
        return Response(serializer.data)


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
    serializer_class = GameSessionSerlizer
    authentication_classes = [JWTAuthentication]  
    permission_classes = [IsAuthenticated] 

    def create(self, request, *args, **kwargs):
        session = start_session(request.user)
        data = GameSessionSerlizer(session).data
        return Response({'session':data}, status=status.HTTP_201_CREATED)

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
        poster_url, is_ended = submit_guess(
            session_id=session_id,
            option=option,
            elapsed_time_ms=elapsed_time_ms,
            version=version,
            user=user,
        )
        payload = {"is_ended": is_ended, "poster_url": poster_url}
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
            "session": GameSessionSerlizer(session).data,
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
        session = end_session(session_id=session_id, version=version, user=user)
        payload = {"session": GameSessionSerlizer(session).data}
        return Response(payload, status=status.HTTP_200_OK)

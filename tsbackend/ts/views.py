from rest_framework.decorators import action
from rest_framework import viewsets
from .models import Song, SongTitle,Poster,GameHistory
from .serializers import SongSerializer, SongTitleSerializer,PosterSerializer,GameHistorySerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
import random
from django.utils import timezone
from datetime import timedelta

class SongViewSet(viewsets.ModelViewSet):
    queryset = Song.objects.all()
    serializer_class = SongSerializer

    @action(detail=False, methods=['get'])
    def random_song(self, request):
        songs = list(Song.objects.all())
        random_song = random.choice(songs)
        serializer = self.get_serializer(random_song)
        return Response(serializer.data)

class SongTitleViewSet(viewsets.ModelViewSet):
    queryset = SongTitle.objects.all().prefetch_related('poster_pics')
    serializer_class = SongTitleSerializer

class PosterViewSet(viewsets.ModelViewSet):
    queryset = Poster.objects.all()
    serializer_class = PosterSerializer

class GameHistoryViewSet(viewsets.ModelViewSet):
    queryset = GameHistory.objects.all().order_by("id")
    serializer_class = GameHistorySerializer

    @action(detail=False, methods=['get'],url_path='top-scores')
    def top_scores(self, request):
        now = timezone.now()
        start_of_week = now - timedelta(days=now.weekday())
        top_scores = GameHistory.objects.filter(start_time__gte=start_of_week).order_by('-score','pk')
        page = self.paginate_queryset(top_scores)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(top_scores, many=True)
        return Response(serializer.data)


@api_view(['GET'])
def rand_titles(request):
    song_titles = list(SongTitle.objects.values_list('title', flat=True))
    random_titles = random.sample(song_titles, 4)
    return Response(random_titles)
from rest_framework.decorators import action
from rest_framework import viewsets
from .models import Song, SongTitle,Poster,GameHistory
from .serializers import SongSerializer, SongTitleSerializer,PosterSerializer,GameHistorySerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
import random

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
    queryset = GameHistory.objects.all()
    serializer_class = GameHistorySerializer

@api_view(['GET'])
def rand_titles(request):
    song_titles = list(SongTitle.objects.values_list('title', flat=True))
    random_titles = random.sample(song_titles, 4)
    return Response(random_titles)
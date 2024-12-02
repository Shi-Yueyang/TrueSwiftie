from rest_framework import viewsets
from .models import Song, SongTitle
from .serializers import SongSerializer, SongTitleSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
import random

class SongViewSet(viewsets.ModelViewSet):
    queryset = Song.objects.all()
    serializer_class = SongSerializer

class SongTitleViewSet(viewsets.ModelViewSet):
    queryset = SongTitle.objects.all()
    serializer_class = SongTitleSerializer

@api_view(['GET'])
def rand_titles(request):
    SongTitles = list(SongTitle.objects.all())
    random_titles = random.sample(SongTitles, 4)
    return Response([title.title for title in random_titles])
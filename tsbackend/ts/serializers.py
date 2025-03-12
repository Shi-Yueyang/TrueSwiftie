from rest_framework import serializers

from .models import Song, SongTitle, GameHistory, Poster, Comment
from core.serializer import UserSerializer

class PosterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Poster
        fields = ['id', 'poster_name', 'image']  

class SongTitleSerializer(serializers.ModelSerializer):

    class Meta:
        model = SongTitle
        fields = ['id', 'title', 'album', 'lyrics', 'poster_pics']

class SongSerializer(serializers.ModelSerializer):
    song_title = SongTitleSerializer()
    class Meta:
        model = Song
        fields = ['id','file', 'song_title']

class GameHistoryWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameHistory
        fields = ['id','user','score','start_time','end_time','correct_choice','last_choice']

class GameHistoryReadSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = GameHistory
        fields = ['id','user','score']


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id','user','comment']
from rest_framework import serializers
from .models import Song, SongTitle, GameHistory

class SongTitleSerializer(serializers.ModelSerializer):
    class Meta:
        model = SongTitle
        fields = ['title','poster_pic']
        
class SongSerializer(serializers.ModelSerializer):
    song_title = SongTitleSerializer()
    class Meta:
        model = Song
        fields = ['id','file', 'song_title']


class GameHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = GameHistory
        fields = ['score']
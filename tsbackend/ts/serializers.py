from rest_framework import serializers
from .models import Song, SongTitle, GameHistory, Poster

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



class GameHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = GameHistory
        fields = ['score','timestamp']
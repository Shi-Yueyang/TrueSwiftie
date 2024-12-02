from rest_framework import serializers
from .models import Song, SongTitle, GameHistory


class SongSerializer(serializers.ModelSerializer):
    class Meta:
        model = Song
        fields = ['id', 'title', 'file']

class SongTitleSerializer(serializers.ModelSerializer):
    class Meta:
        model = SongTitle
        fields = ['title']

class GameHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = GameHistory
        fields = ['score']
from rest_framework import serializers

from .models import Song, SongTitle, Poster, Comment, GameSession, GameTurn
from core.serializer import UserSerializer


class PosterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Poster
        fields = ["id", "poster_name", "image"]


class SongTitleSerializer(serializers.ModelSerializer):

    class Meta:
        model = SongTitle
        fields = ["id", "title", "album", "lyrics", "poster_pics"]


class SongSerializer(serializers.ModelSerializer):
    song_title = SongTitleSerializer()

    class Meta:
        model = Song
        fields = ["id", "file", "song_title"]



class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ["id", "user", "comment"]


class GameTurnSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameTurn
        fields = [
            "id",
            "song",
            "options",
            "time_limit_secs",
            "poster_url",
            "outcome"
        ]


class GameSessionSerlaiizer(serializers.ModelSerializer):
    class Meta:
        model = GameSession
        fields = [
            "id",
            "user",
            "score",
            "current_turn",
            "next_turn",
            "version",
            "status",
            "health"
        ]

class GuessSerializer(serializers.Serializer):
    option = serializers.CharField()
    version = serializers.IntegerField()
    elapsed_time_ms = serializers.IntegerField()

class VersionNumberSerializer(serializers.Serializer):
    version = serializers.IntegerField()


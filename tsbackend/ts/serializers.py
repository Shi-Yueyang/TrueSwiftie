from rest_framework import serializers

from .models import Song, SongTitle, GameHistory, Poster, Comment, GameSession, GameTurn
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


class GameHistoryWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameHistory
        fields = [
            "id",
            "user",
            "score",
            "start_time",
            "end_time",
            "correct_choice",
            "last_choice",
            "likes",
        ]


class GameHistoryReadSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = GameHistory
        fields = ["id", "user", "score", "likes"]


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
        ]


class GameSessionSerlizer(serializers.ModelSerializer):
    class Meta:
        model = GameSession
        fields = [
            "id",
            "user",
            "score",
            "status",
            "current_turn",
            "max_turns",
            "created_at",
            "updated_at",
        ]

class GuessSerializer(serializers.Serializer):
    option = serializers.CharField()
    version = serializers.IntegerField()
    elapsed_time_ms = serializers.IntegerField()

class VersionNumberSerializer(serializers.Serializer):
    version = serializers.IntegerField()


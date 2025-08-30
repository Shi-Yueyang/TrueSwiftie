from django.db import models
from django.utils import timezone
from django.db.models import JSONField
from core.models import CustomUser as User


# Create your models here.
class Song(models.Model):
    file = models.FileField(upload_to="songs/", unique=True)
    song_title = models.ForeignKey(
        "SongTitle", on_delete=models.SET_NULL, default=1, null=True
    )
    original_file_name = models.CharField(max_length=255, null=True)

    def __str__(self):
        return self.file.name


class Poster(models.Model):
    poster_name = models.CharField(max_length=255, default="")
    image = models.ImageField(upload_to="posters/")

    def __str__(self):
        return self.poster_name


class SongTitle(models.Model):
    title = models.CharField(max_length=255, unique=True, default="")
    album = models.CharField(max_length=255, default="")
    lyrics = models.TextField(default="")
    poster_pics = models.ManyToManyField(Poster, related_name="song_titles", blank=True)

    def __str__(self):
        return self.title


class GameHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    score = models.IntegerField()
    start_time = models.DateTimeField(auto_now=False)
    end_time = models.DateTimeField(auto_now=False)
    correct_choice = models.CharField(max_length=255, default="null")
    last_choice = models.CharField(max_length=255, default="null")
    likes = models.IntegerField(default=0)


class Comment(models.Model):
    user = models.CharField(max_length=255)
    comment = models.TextField()


class GameSessionStatus(models.TextChoices):
    IDLE = "idle", "Idle"
    IN_PROGRESS = "in_progress", "In Progress"
    REVEALING = "revealing", "Revealing"
    ENDED = "ended", "Ended"


class GameTurnOutcome(models.TextChoices):
    PENDING = "pending"
    CORRECT = "correct"
    WRONG = "wrong"
    TIMEOUT = "timeout"


class GameSession(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="game_sessions"
    )
    status = models.CharField(
        max_length=16,
        choices=GameSessionStatus.choices,
        default=GameSessionStatus.IN_PROGRESS,
        db_index=True,
    )
    score = models.PositiveIntegerField(default=0)
    version = models.PositiveIntegerField(default=1)  # optimistic concurrency
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    current_turn = models.ForeignKey(
        "GameTurn",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+",
    )
    max_turns = models.PositiveIntegerField(default=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=("user", "status")),
        ]

    def __str__(self):
        return f"Session {self.id} (user={self.user_id}, score={self.score}, status={self.status})"

    def increment_version(self):
        self.version = models.F("version") + 1  # use in update queries

    @property
    def is_active(self):
        return self.status not in (GameSessionStatus.ENDED,)


class GameTurn(models.Model):
    session = models.ForeignKey(
        GameSession, on_delete=models.CASCADE, related_name="turns"
    )
    sequence_index = models.PositiveIntegerField()
    song = models.ForeignKey(Song, on_delete=models.PROTECT, related_name="turns")
    # List of option strings shown to user
    options = JSONField(default=list)
    # Store the correct option string (NOT sent to client until answered)
    correct_option = models.CharField(max_length=255)
    selected_option = models.CharField(max_length=255, null=True, blank=True)
    outcome = models.CharField(
        max_length=10,
        choices=GameTurnOutcome.choices,
        default=GameTurnOutcome.PENDING,
        db_index=True,
    )
    poster_url = models.URLField(max_length=200, blank=True, null=True)
    snippet_start_sec = models.PositiveIntegerField(default=0)
    time_limit_secs = models.PositiveIntegerField(default=10)
    created_at = models.DateTimeField(auto_now_add=True)
    answered_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ("session", "sequence_index")
        unique_together = (("session", "sequence_index"),)
        indexes = [
            models.Index(fields=("session", "outcome")),
        ]

    def __str__(self):
        return f"Turn {self.id} (session={self.session_id}, idx={self.sequence_index}, outcome={self.outcome})"

    def mark_answer(self, option: str, outcome: str):
        self.selected_option = option
        self.outcome = outcome
        self.answered_at = timezone.now()

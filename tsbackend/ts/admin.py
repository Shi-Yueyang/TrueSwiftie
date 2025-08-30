from django.contrib import admin
from .models import (
    GameSession,
    GameTurn,
    Song,
    SongTitle,
    GameHistory,
    Poster,
    Comment,
    GameTurnOutcome,
)
from django.db import models
from django import forms


class SongAdmin(admin.ModelAdmin):
    list_display = ("id", "song_title", "original_file_name", "file")
    search_fields = ("file", "song_title__title")
    list_filter = ("song_title__album",)
    raw_id_fields = ("song_title",)


class SongTitleAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "album")
    search_fields = ("title",)
    list_filter = ("album",)
    filter_horizontal = ("poster_pics",)


class GameHistoryAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "score", "start_time", "likes")
    search_fields = ("user",)
    list_filter = ("user",)


class PosterAdmin(admin.ModelAdmin):
    list_display = ("id", "image", "related_song_titles")
    search_fields = ("image",)
    list_filter = ("image",)

    def related_song_titles(self, obj):
        return ", ".join([st.title for st in obj.song_titles.all()])

    related_song_titles.short_description = "Related Song Titles"


class CommentAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "comment")
    search_fields = ("user", "comment")
    list_filter = ("user",)


class GameTurnInline(admin.TabularInline):
    model = GameTurn
    extra = 0
    fields = (
        "sequence_index",
        "song",
        "outcome",
        "selected_option",
        "correct_option",
        "time_limit_secs",
        "snippet_start_sec",
        "created_at",
        "answered_at",
    )
    readonly_fields = (
        "sequence_index",
        "song",
        "outcome",
        "selected_option",
        "correct_option",
        "time_limit_secs",
        "snippet_start_sec",
        "created_at",
        "answered_at",
    )
    can_delete = False
    ordering = ("sequence_index",)


class GameTurnInlineForm(forms.ModelForm):
    class Meta:
        model = GameTurn
        fields = "__all__"

    # Optional: pretty-print JSONField initial
    def clean_options(self):
        data = self.cleaned_data["options"]
        return data


class GameTurnInline(admin.TabularInline):
    model = GameTurn
    form = GameTurnInlineForm
    extra = 0
    show_change_link = True
    fields = (
        "sequence_index",
        "song",
        "options",
        "correct_option",
        "selected_option",
        "outcome",
        "snippet_start_sec",
        "time_limit_secs",
        "created_at",
        "answered_at",
    )
    readonly_fields = ("created_at", "answered_at")
    formfield_overrides = {
        models.JSONField: {
            "widget": admin.widgets.AdminTextareaWidget(attrs={"rows": 4, "cols": 60})
        }
    }
    ordering = ("sequence_index",)


@admin.register(GameSession)
class GameSessionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "status",
        "score",
        "version",
        "current_turn",
        "started_at",
        "ended_at",
    )
    list_filter = ("status", "started_at")
    search_fields = ("user__username", "id")
    raw_id_fields = ("user", "current_turn")
    inlines = [GameTurnInline]
    # Keep timestamps read-only; allow editing others
    readonly_fields = ("started_at", "ended_at")
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "user",
                    "status",
                    "score",
                    "version",
                    "current_turn",
                    "max_turns",
                )
            },
        ),
        (
            "Timestamps",
            {
                "fields": ("started_at", "ended_at"),
            },
        ),
    )

    def get_readonly_fields(self, request, obj=None):
        """
        If you truly want everything editable, remove overrides here.
        """
        ro = list(self.readonly_fields)
        # Prevent manual version tampering unless needed
        # Comment next line if you want to edit version:
        # ro.append("version")
        return ro

    def save_model(self, request, obj, form, change):
        # (Optional) auto-sync score from correct turns if admin changed turns
        if change:
            if obj.turns.exists():
                obj.score = obj.turns.filter(outcome=GameTurnOutcome.CORRECT).count()
        super().save_model(request, obj, form, change)


@admin.register(GameTurn)
class GameTurnAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "session",
        "sequence_index",
        "song",
        "outcome",
        "selected_option",
        "snippet_start_sec",
        "time_limit_secs",
        "created_at",
        "answered_at",
        "poster_url"
    )
    list_filter = ("outcome", "created_at")
    search_fields = ("session__id", "song__song_title__title", "correct_option")
    raw_id_fields = ("session", "song")
    ordering = ("session", "sequence_index")
    formfield_overrides = {
        models.JSONField: {
            "widget": admin.widgets.AdminTextareaWidget(attrs={"rows": 4, "cols": 80})
        }
    }


admin.site.register(Song, SongAdmin)
admin.site.register(SongTitle, SongTitleAdmin)
admin.site.register(GameHistory, GameHistoryAdmin)
admin.site.register(Poster, PosterAdmin)
admin.site.register(Comment, CommentAdmin)

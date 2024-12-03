from django.contrib import admin
from .models import Song, SongTitle, GameHistory

class SongAdmin(admin.ModelAdmin):
    list_display = ('id', 'file', 'song_title')
    search_fields = ('file', 'song_title__title')
    list_filter = ('song_title',)

class SongTitleAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'poster_pic')
    search_fields = ('title',)
    list_filter = ('title',)

class GameHistoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'score')
    search_fields = ('score',)
    list_filter = ('score',)

admin.site.register(Song, SongAdmin)
admin.site.register(SongTitle, SongTitleAdmin)
admin.site.register(GameHistory, GameHistoryAdmin)
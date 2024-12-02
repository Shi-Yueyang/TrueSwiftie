from django.contrib import admin
from .models import Song,SongTitle

@admin.register(Song)
class SongAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'file')
    search_fields = ('title',)

@admin.register(SongTitle)
class SongTitleAdmin(admin.ModelAdmin):
    list_display = ('id', 'title')
    search_fields = ('title',)
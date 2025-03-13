from django.contrib import admin
from .models import Song, SongTitle, GameHistory,Poster, Comment

class SongAdmin(admin.ModelAdmin):
    list_display = ('id', 'file', 'song_title','original_file_name')
    search_fields = ('file', 'song_title__title')
    list_filter = ('song_title__album',)
    raw_id_fields = ('song_title',) 

class SongTitleAdmin(admin.ModelAdmin):
    list_display = ('id', 'title','album')
    search_fields = ('title',)
    list_filter = ('album',)
    filter_horizontal = ('poster_pics',) 
    
class GameHistoryAdmin(admin.ModelAdmin):
    list_display = ('id',  'user', 'score','start_time')
    search_fields = ('user',)
    list_filter = ('user',)

class PosterAdmin(admin.ModelAdmin):
    list_display = ('id', 'image', 'related_song_titles')
    search_fields = ('image',)
    list_filter = ('image',)

    def related_song_titles(self, obj):
        return ", ".join([st.title for st in obj.song_titles.all()])
    related_song_titles.short_description = 'Related Song Titles'

class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'comment')
    search_fields = ('user', 'comment')
    list_filter = ('user',)

admin.site.register(Song, SongAdmin)
admin.site.register(SongTitle, SongTitleAdmin)
admin.site.register(GameHistory, GameHistoryAdmin)
admin.site.register(Poster,PosterAdmin)
admin.site.register(Comment,CommentAdmin)
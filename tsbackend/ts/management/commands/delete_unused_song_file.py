from django.core.management.base import BaseCommand
from django.db.models import Count
from ts.models import Song
import tsbackend.settings as settings
import os
class Command(BaseCommand):
    help = 'Automatically delete unused song files'

    def handle(self, *args, **kwargs):
        # delete duplicated songs
        duplicates = Song.objects.values('song_title', 'original_file_name') \
                .annotate(count=Count('id')) \
                .filter(count__gt=1)
        for duplicate in duplicates:
            song_title = duplicate['song_title']
            original_file_name = duplicate['original_file_name']
            duplicate_songs = Song.objects.filter(
                song_title=song_title, 
                original_file_name=original_file_name).order_by('id')
            keep_song = duplicate_songs.first()
            duplicate_songs_to_delete = duplicate_songs.exclude(id=keep_song.id)
            # Delete files from media storage
            for song in duplicate_songs_to_delete:
                if song.file:
                    file_path = os.path.join(settings.MEDIA_ROOT, song.file.name)
                    if os.path.exists(file_path):
                        try:
                            song.delete()
                            os.remove(file_path)
                            self.stdout.write(f'Deleted duplicate song {song.original_file_name}')
                        except Exception as e:
                            self.stderr.write(self.style.ERROR(f'Error deleting file {file_path}: {e}'))
        
        # # delete song whose song file doesn't exist
        songs = Song.objects.all()
        for song in songs:
            if song.file:
                file_path = os.path.join(settings.MEDIA_ROOT, song.file.name)
                if not os.path.exists(file_path):
                    song.delete()
                    self.stdout.write(self.style.SUCCESS(f'{song.original_file_name} has no file - deleted'))

        # delete unused song files
        songs = Song.objects.all()
        song_files = set()
        for song in songs:
            song_files.add(song.file)
        
        song_dir = os.path.join(settings.MEDIA_ROOT, 'songs')
        for root, _, files in os.walk(song_dir):
            for filename in files:
                file_path_to_project = os.path.join('songs', filename)
                if file_path_to_project not in song_files:
                    file_path_on_system = os.path.join(root, filename)
                    os.remove(file_path_on_system)
                    self.stdout.write(self.style.SUCCESS(f'Deleted {file_path_on_system}'))
        
        
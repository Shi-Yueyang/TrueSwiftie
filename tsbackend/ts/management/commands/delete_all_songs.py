from django.core.management.base import BaseCommand
from django.db.models import Count
from ts.models import Song
import tsbackend.settings as settings
import os
class Command(BaseCommand):
    help = 'Automatically delete all songs and their files'
    def handle(self, *args, **kwargs):
        # delete all songs
        songs = Song.objects.all()
        for song in songs:
            if song.file:
                file_path = os.path.join(settings.MEDIA_ROOT, song.file.name)
                if os.path.exists(file_path):
                    try:
                        song.delete()
                        os.remove(file_path)
                        self.stdout.write(f'Deleted song {song.original_file_name}')
                    except Exception as e:
                        self.stderr.write(self.style.ERROR(f'Error deleting file {file_path}: {e}'))
            else:
                song.delete()
                self.stdout.write(f'Deleted song {song.original_file_name} without file')
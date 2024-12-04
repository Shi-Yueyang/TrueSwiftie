import os
from django.core.management.base import BaseCommand
from ts.models import Song, SongTitle
from mutagen.mp3 import MP3
from mutagen.id3 import ID3, TIT2

class Command(BaseCommand):
    help = 'Automatically dump Song models from a bunch of audio files'

    def add_arguments(self, parser):
        parser.add_argument('directory', type=str, help='Directory containing audio files')

    def handle(self, *args, **kwargs):
        directory = kwargs['directory']
        if not os.path.isdir(directory):
            self.stderr.write(self.style.ERROR(f'{directory} is not a valid directory'))
            return

        for root, _, files in os.walk(directory):
            for filename in files:
                if filename.endswith(('.mp3', '.wav', '.flac')):  # Add more audio file extensions if needed
                    file_path = os.path.join(root, filename)
                    target_path = os.path.join('songs', filename)
                    song_title = None

                    if filename.endswith('.mp3'):
                        try:
                            audio = MP3(file_path, ID3=ID3)
                            if 'TIT2' in audio:
                                song_title_str = audio['TIT2'].text[0]
                                song_title = SongTitle.objects.filter(title=song_title_str).first()
                        except Exception as e:
                            self.stderr.write(self.style.ERROR(f'Error reading {file_path}: {e}'))

                    song = Song.objects.create(file=target_path, song_title=song_title)
                    self.stdout.write(self.style.SUCCESS(f'Successfully created Song: {song}'))
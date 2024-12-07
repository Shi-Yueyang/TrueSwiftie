import os
import shutil
from django.core.management.base import BaseCommand
from ts.models import Song, SongTitle
from mutagen.mp3 import MP3
from mutagen.flac import FLAC
from mutagen.id3 import ID3, TIT2
import tsbackend.settings as settings
def clean_song_title(title):
    if title.endswith('1') and not title.endswith(' 1'):
        return title[:-1]
    title = title.replace('’', "'")
    title = title.replace("&#39;s","'s")
    title = title.replace("(From The Vault)","[From The Vault]")
    title = title.replace("(Piano Version) (Taylor's Version)","(Piano Version) [Taylor's Version]")
    title = title.replace("(Acoustic Version) (Taylor's Version)","(Acoustic Version) [Taylor's Version]")
    return title

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
                    file_path_on_system = os.path.join(root, filename)
                    relative_path_to_project = os.path.join('songs', filename)
                    file_path_to_project = os.path.join(settings.MEDIA_ROOT, relative_path_to_project)
                    song_title = None

                    if filename.endswith('.mp3'):
                        try:
                            audio = MP3(file_path_on_system, ID3=ID3)
                            if 'TIT2' in audio:
                                song_title_str = audio['TIT2'].text[0]
                                song_title_str = clean_song_title(song_title_str)
                                song_title = SongTitle.objects.filter(title=song_title_str).first()
                        except Exception as e:
                            self.stderr.write(self.style.ERROR(f'Error reading {file_path_on_system}: {e}'))
                    elif filename.endswith('.flac'):
                        try:
                            audio = FLAC(file_path_on_system)
                            if 'title' in audio:
                                song_title_str = audio['title'][0]
                                song_title_str = clean_song_title(song_title_str)
                                song_title = SongTitle.objects.filter(title=song_title_str).first()
                        except Exception as e:
                            self.stderr.write(self.style.ERROR(f'Error reading {file_path_on_system}: {e}'))
                    song = Song.objects.filter(file=relative_path_to_project).first()

                    if song:
                        if song_title and song.song_title != song_title:
                            song.song_title = song_title
                            song.save()
                            self.stdout.write(self.style.SUCCESS(f'updated Song {song}'))
                    else:
                        song = Song.objects.create(file=relative_path_to_project, song_title=song_title)
                        if not os.path.exists(file_path_to_project):
                            shutil.copyfile(file_path_on_system, file_path_to_project)
                        self.stdout.write(self.style.SUCCESS(f'created Song {song}'))
                        
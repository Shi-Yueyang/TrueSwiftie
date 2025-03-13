import base64
import os
from random import randint
import shutil
from django.core.management.base import BaseCommand
from ts.models import Song, SongTitle
from mutagen.mp3 import MP3
from mutagen.flac import FLAC
from mutagen.id3 import ID3
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

def encrypt_filename(filename):
    # Separate the filename and extension
    name, ext = os.path.splitext(filename)
    key = randint(1, 255)
    name_bytes = name.encode('utf-8')
    xored_bytes = bytes(b ^ key for b in name_bytes)
    # Encode with base64 and decode to string
    encrypted = base64.urlsafe_b64encode(xored_bytes).decode('utf-8')
    encrypted = encrypted.rstrip('=')
    if len(encrypted) > 20:
        encrypted = encrypted[:20]
    
    return f"{encrypted}{ext}"

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
                    song = Song.objects.filter(song_title__title=song_title_str).first()

                    if song:
                        if song_title and song.song_title != song_title:
                            song.song_title = song_title
                            song.save()
                            self.stdout.write(self.style.SUCCESS(f'updated Song {song}'))
                        else:
                            self.stdout.write(self.style.WARNING(f'[{song_title.title}] already exists'))
                    else:
                        encrypted_filename = encrypt_filename(filename)
                        relative_path_to_project = os.path.join('songs', encrypted_filename)
                        file_path_to_project = os.path.join(settings.MEDIA_ROOT, relative_path_to_project)
                        counter = 1
                        while os.path.exists(file_path_to_project):
                            encrypted_filename = encrypted_filename+str(counter)
                            relative_path_to_project = os.path.join('songs', encrypted_filename)
                            file_path_to_project = os.path.join(settings.MEDIA_ROOT, relative_path_to_project)
                            counter += 1              
                                      
                        song = Song.objects.create(file=relative_path_to_project, song_title=song_title,original_file_name=filename)
                        shutil.copyfile(file_path_on_system, file_path_to_project)
                        self.stdout.write(self.style.SUCCESS(f'created Song {song}'))
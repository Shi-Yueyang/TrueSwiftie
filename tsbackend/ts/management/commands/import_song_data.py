import csv
from django.core.management.base import BaseCommand
from ts.models import SongTitle

class Command(BaseCommand):
    help = 'Import songs from a CSV file'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='The path to the CSV file')

    def handle(self, *args, **kwargs):
        csv_file = kwargs['csv_file']
        with open(csv_file, newline='', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                title = row['track_name']
                album = row['album_name']
                lyrics = row['lyrics']
                if title == '':
                    continue
                song_title = SongTitle.objects.filter(title=title).first()
                if song_title:
                    if album and not album.isspace() and song_title.album != album:
                        song_title.album = album
                        self.stdout.write(self.style.SUCCESS(f'update {title} album to {album}'))

                    if lyrics and not lyrics.isspace() and song_title.lyrics != lyrics:
                        song_title.lyrics = lyrics
                        self.stdout.write(self.style.SUCCESS(f'update {title} lyrics'))
                    song_title.save()
                else:
                    SongTitle.objects.create(
                        title=title,
                        album=album,
                        lyrics=lyrics
                    )
                    self.stdout.write(self.style.SUCCESS(f'Create {title}'))
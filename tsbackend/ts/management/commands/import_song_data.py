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
                title = row['Title']
                album = row['Album']
                lyrics = row['Lyrics']
                SongTitle.objects.update_or_create(
                    title=title,
                    defaults={'album': album, 'lyrics': lyrics}
                )
        self.stdout.write(self.style.SUCCESS('Successfully imported songs'))
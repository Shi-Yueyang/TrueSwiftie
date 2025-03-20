import os
from django.core.management.base import BaseCommand
from django.core.files import File
from ts.models import Poster, SongTitle
import tsbackend.settings as settings

class Command(BaseCommand):
    help = 'Import a folder of pictures of each eras'

    def add_arguments(self, parser):
        parser.add_argument('path', type=str, help='The path to the folder containing CD cover images')

    def handle(self, *args, **kwargs):
        path = kwargs['path']

        if not os.path.exists(path):
            self.stdout.write(self.style.ERROR(f'The path {path} does not exist'))
            return

        if os.path.isdir(path):
            for root, _,files in os.walk(path):
                era = os.path.basename(root)
                for filename in files:
                    target_filepath = os.path.join(settings.MEDIA_ROOT, 'posters', filename)
                    if os.path.exists(target_filepath):
                        self.stdout.write(self.style.WARNING(f'{filename} already exists'))
                        continue
                    song_titles = SongTitle.objects.filter(album__istartswith=era)
                    file_path = os.path.join(root, filename)
                    with open(file_path, 'rb') as f:
                        poster = Poster(poster_name=filename.split('.')[0])
                        poster.image.save(filename, File(f), save=True)
                        poster.song_titles.set(song_titles)
                        poster.save()
                        self.stdout.write(self.style.SUCCESS(f'Successfully added {filename}'))


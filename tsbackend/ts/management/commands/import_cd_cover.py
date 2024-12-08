import os
from django.core.management.base import BaseCommand
from django.core.files.storage import default_storage
from django.core.files import File
from ts.models import Poster, SongTitle

class Command(BaseCommand):
    help = 'Import a folder of CD cover images and add them to the Poster model'

    def add_arguments(self, parser):
        parser.add_argument('path', type=str, help='The path to the folder containing CD cover images')

    def handle(self, *args, **kwargs):
        path = kwargs['path']

        if not os.path.exists(path):
            self.stdout.write(self.style.ERROR(f'The path {path} does not exist'))
            return

        if os.path.isdir(path):
            files = [os.path.join(path, filename) for filename in os.listdir(path)]
        elif os.path.isfile(path):
            files = [path]
        else:
            self.stdout.write(self.style.ERROR(f'The path {path} does not exist or is not a valid file/directory'))
            return
        

        for file_path in files:
            filename = os.path.basename(file_path)
            cd_name = filename.split('.')[0]
            song_titles = SongTitle.objects.filter(album__iexact=cd_name)
            if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
                with open(file_path, 'rb') as f:
                    poster = Poster(poster_name=filename.split('.')[0])
                    poster.image.save(filename, File(f), save=True)
                    poster.song_titles.set(song_titles)
                    poster.save()
                    self.stdout.write(self.style.SUCCESS(f'Successfully added {filename}'))
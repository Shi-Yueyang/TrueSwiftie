import os
from django.core.management.base import BaseCommand
from django.core.files import File
from ts.models import Poster

class Command(BaseCommand):
    help = 'Import a folder of CD cover images and add them to the Poster model'

    def add_arguments(self, parser):
        parser.add_argument('folder_path', type=str, help='The path to the folder containing CD cover images')

    def handle(self, *args, **kwargs):
        folder_path = kwargs['folder_path']

        if not os.path.isdir(folder_path):
            self.stdout.write(self.style.ERROR(f'The folder path {folder_path} does not exist or is not a directory'))
            return

        for filename in os.listdir(folder_path):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
                file_path = os.path.join(folder_path, filename)
                relative_path_to_project = os.path.join('songs', filename)
                with open(file_path, 'rb') as f:
                    poster = Poster(poster_name=relative_path_to_project)
                    poster.image.save(filename, File(f), save=True)
                    self.stdout.write(self.style.SUCCESS(f'Successfully added {filename} to Poster model'))

        self.stdout.write(self.style.SUCCESS('All images have been imported successfully'))
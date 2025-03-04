from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group

class Command(BaseCommand):
    help = 'Create two groups: Group1 and Group2'

    def handle(self, *args, **kwargs):
        group_names = ['formal']
        for group_name in group_names:
            group, created = Group.objects.get_or_create(name=group_name)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Successfully created group "{group_name}"'))
            else:
                self.stdout.write(self.style.WARNING(f'Group "{group_name}" already exists'))
# Generated by Django 5.1.3 on 2024-12-05 06:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ts', '0007_alter_song_song_title'),
    ]

    operations = [
        migrations.AddField(
            model_name='poster',
            name='poster_name',
            field=models.CharField(default='', max_length=255),
        ),
    ]
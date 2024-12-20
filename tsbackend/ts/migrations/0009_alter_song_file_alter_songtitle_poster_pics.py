# Generated by Django 5.1.3 on 2024-12-07 03:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ts', '0008_poster_poster_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='song',
            name='file',
            field=models.FileField(unique=True, upload_to='songs/'),
        ),
        migrations.AlterField(
            model_name='songtitle',
            name='poster_pics',
            field=models.ManyToManyField(blank=True, related_name='song_titles', to='ts.poster'),
        ),
    ]

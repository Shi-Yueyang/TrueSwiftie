# Generated by Django 5.1.3 on 2024-12-04 06:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ts', '0004_remove_song_title_song_song_title_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Poster',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.ImageField(upload_to='posters/')),
            ],
        ),
        migrations.RemoveField(
            model_name='songtitle',
            name='poster_pic',
        ),
        migrations.AddField(
            model_name='songtitle',
            name='poster_pics',
            field=models.ManyToManyField(related_name='song_titles', to='ts.poster'),
        ),
    ]
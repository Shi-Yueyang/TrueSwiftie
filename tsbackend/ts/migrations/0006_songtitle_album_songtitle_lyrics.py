# Generated by Django 5.1.3 on 2024-12-04 07:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ts', '0005_poster_remove_songtitle_poster_pic_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='songtitle',
            name='album',
            field=models.CharField(default='', max_length=255),
        ),
        migrations.AddField(
            model_name='songtitle',
            name='lyrics',
            field=models.TextField(default=''),
        ),
    ]
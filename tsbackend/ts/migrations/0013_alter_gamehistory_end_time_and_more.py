# Generated by Django 5.1.3 on 2024-12-10 07:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ts', '0012_rename_timestamp_gamehistory_start_time_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='gamehistory',
            name='end_time',
            field=models.DateTimeField(),
        ),
        migrations.AlterField(
            model_name='gamehistory',
            name='start_time',
            field=models.DateTimeField(),
        ),
    ]
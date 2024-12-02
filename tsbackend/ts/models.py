from django.db import models

# Create your models here.
class Song(models.Model):
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='songs/')

class SongTitle(models.Model):
    title = models.CharField(max_length=255, unique=True)

class GameHistory(models.Model):
    score = models.IntegerField()
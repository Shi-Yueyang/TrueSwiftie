from django.db import models

# Create your models here.
class Song(models.Model):
    file = models.FileField(upload_to='songs/')
    song_title = models.ForeignKey('SongTitle', on_delete=models.CASCADE,default=1)
    def __str__(self):
        return self.file.name

class SongTitle(models.Model):
    title = models.CharField(max_length=255, unique=True,default='')
    poster_pic = models.ImageField(upload_to='posters/',default='posters/default.jpg')
    def __str__(self):
        return self.title
    
class GameHistory(models.Model):
    score = models.IntegerField()
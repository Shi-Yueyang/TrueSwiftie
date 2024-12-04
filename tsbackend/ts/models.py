from django.db import models

# Create your models here.
class Song(models.Model):
    file = models.FileField(upload_to='songs/')
    song_title = models.ForeignKey('SongTitle', on_delete=models.CASCADE,default=1)
    def __str__(self):
        return self.file.name
    
class Poster(models.Model):
    image = models.ImageField(upload_to='posters/')

    def __str__(self):
        return self.image.name
    
class SongTitle(models.Model):
    title = models.CharField(max_length=255, unique=True,default='')
    album = models.CharField(max_length=255, default='')
    lyrics = models.TextField(default='')
    poster_pics = models.ManyToManyField(Poster, related_name='song_titles')
    def __str__(self):
        return self.title
    
class GameHistory(models.Model):
    score = models.IntegerField()
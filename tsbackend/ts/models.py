from django.db import models
from core.models import CustomUser as User
# Create your models here.
class Song(models.Model):
    file = models.FileField(upload_to='songs/', unique=True)
    song_title = models.ForeignKey('SongTitle', on_delete=models.SET_NULL,default=1,null=True)
    original_file_name = models.CharField(max_length=255,null=True)
    def __str__(self):
        return self.file.name
    
class Poster(models.Model):
    poster_name = models.CharField(max_length=255, default='');
    image = models.ImageField(upload_to='posters/')
    def __str__(self):
        return self.poster_name
    
class SongTitle(models.Model):
    title = models.CharField(max_length=255, unique=True,default='')
    album = models.CharField(max_length=255, default='')
    lyrics = models.TextField(default='')
    poster_pics = models.ManyToManyField(Poster, related_name='song_titles',blank=True)
    def __str__(self):
        return self.title
    
class GameHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE,null=True)
    score = models.IntegerField()
    start_time = models.DateTimeField(auto_now=False)
    end_time = models.DateTimeField(auto_now=False)
    correct_choice = models.CharField(max_length=255,default='null')
    last_choice = models.CharField(max_length=255,default='null')
    likes = models.IntegerField(default=0)
    
class Comment(models.Model):
    user = models.CharField(max_length=255)
    comment = models.TextField()
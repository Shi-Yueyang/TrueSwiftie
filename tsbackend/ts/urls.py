from django.urls import path,include
from .views import StreamSongView
from rest_framework.routers import DefaultRouter


urlpatterns = [
    path('stream-song/<int:song_id>/<int:start_point>/', StreamSongView.as_view(), name='stream_song'),
]

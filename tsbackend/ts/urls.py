from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SongViewSet, rand_titles, SongTitleViewSet, PosterViewSet

router = DefaultRouter()
router.register(r'songs', SongViewSet)
router.register(r'song-titles', SongTitleViewSet)
router.register(r'posters', PosterViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('random-titles/', rand_titles, name='random-titles'),

]
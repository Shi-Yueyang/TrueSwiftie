from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SongViewSet, rand_titles, SongTitleViewSet, PosterViewSet, GameHistoryViewSet, CommentViewSet, GameSessionViewSet

router = DefaultRouter()
router.register(r'songs', SongViewSet)
router.register(r'song-titles', SongTitleViewSet)
router.register(r'posters', PosterViewSet)
router.register(r'game-histories', GameHistoryViewSet)
router.register(r'comments', CommentViewSet)
router.register(r'game-sessions', GameSessionViewSet,basename='game-session')


urlpatterns = [
    path('', include(router.urls)),
    path('random-titles/', rand_titles, name='random-titles'),

]
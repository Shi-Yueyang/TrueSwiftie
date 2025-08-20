from django.urls import path,include
from .views import CsrfTokenView, TemporaryUserLoginView, UserViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
urlpatterns = [
    path('csrf/', CsrfTokenView.as_view(), name='csrf_token'),
    path('temporary-login/', TemporaryUserLoginView.as_view(), name='temporary_login'),
    path('', include(router.urls)),

]
from django.urls import path
from .views import CsrfTokenView, TemporaryUserLoginView

urlpatterns = [
    path('csrf/', CsrfTokenView.as_view(), name='csrf_token'),
    path('temporary-login/', TemporaryUserLoginView.as_view(), name='temporary_login'),
]
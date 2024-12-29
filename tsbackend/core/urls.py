from django.urls import path
from .views import CsrfTokenView, AnonymousLoginView

urlpatterns = [
    path('csrf/', CsrfTokenView.as_view(), name='csrf_token'),
    path('anonymous-login/', AnonymousLoginView.as_view(), name='anonymous_login'),
]
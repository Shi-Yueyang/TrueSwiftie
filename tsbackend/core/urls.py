from django.urls import path
from .views import CsrfTokenView

urlpatterns = [
    path('csrf/', CsrfTokenView.as_view(), name='csrf'),
]
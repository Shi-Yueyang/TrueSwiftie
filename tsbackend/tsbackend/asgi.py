import os

# Ensure DJANGO_SETTINGS_MODULE is set before importing any Django modules
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tsbackend.settings')

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

# Initialize Django application before importing app modules that may import models.
django_asgi_app = get_asgi_application()

import ts.routing  # import after Django setup

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(
            ts.routing.websocket_urlpatterns
        )
    ),
})

from django.urls import re_path

from .consumers import RoomConsumer, LobbyConsumer


websocket_urlpatterns = [
    # Join dualmode by numeric id or uuid
    re_path(r"^ws/ts/dualmode/(?P<room_id>[\w-]+)/$", RoomConsumer.as_asgi()),
    # Global lobby broadcast
    re_path(r"^ws/ts/lobby/$", LobbyConsumer.as_asgi()),
]

from typing import Any, Dict, Optional, Set, List
import asyncio
import logging
import uuid
from dataclasses import dataclass, field
from django.utils import timezone
from .models import RoomStatus
from channels.generic.websocket import AsyncJsonWebsocketConsumer,AsyncWebsocketConsumer

logger = logging.getLogger(__name__)

@dataclass
class LiveRoom:
    id: str
    status: str = RoomStatus.WAITING
    player_1: Optional[int] = None
    player_2: Optional[int] = None
    player_1_score: int = 0
    player_2_score: int = 0
    current_song: Optional[int] = None
    members: Set[str] = field(default_factory=set)
    created_at: Any = field(default_factory=timezone.now)
    updated_at: Any = field(default_factory=timezone.now)

    def to_dict(self) -> Dict[str, Any]:
        status_value = getattr(self.status, "value", self.status)
        return {
            "id": self.id,
            "status": status_value,
            "player_1": self.player_1,
            "player_2": self.player_2,
            "player_1_score": self.player_1_score,
            "player_2_score": self.player_2_score,
            "current_song": self.current_song,
            "members": len(self.members),
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


class RoomConsumer(AsyncJsonWebsocketConsumer):
    group_name: str
    room_id: str

    async def connect(self):
        self.room_id = self.scope["url_route"]["kwargs"]["room_id"]
        self.group_name = f"room_{self.room_id}"
        
        user = self.scope.get("user")
        print(f"RoomConsumer: connecting to room {self.room_id} for user {getattr(user, 'id', None)}")
        room_state = await LobbyConsumer.add_member(self.room_id, self.channel_name, user)
        
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        # Send current room state to the connecting user
        await self.send_json({
            "type": "room_state",
            "data": room_state
        })

        # Broadcast to room that someone joined
        user_info = None
        if user and getattr(user, "is_authenticated", False):
            user_info = {
                "id": user.id,
                "username": user.username,
                "avatar": getattr(user, "avatar", None) and str(user.avatar.url) or None
            }

        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "broadcast",
                "message_type": "player_joined",
                "data": {
                    "room_id": self.room_id,
                    "user": user_info
                },
                "sender": "system",
            },
        )

        # broadcast updated rooms list to lobby
        await self.channel_layer.group_send(
            LobbyConsumer.group_name,
            {
                "type": "broadcast",
                "message_type": "rooms",
                "data": await LobbyConsumer.snapshot_rooms(),
            },
        )

    async def disconnect(self, code: int):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)
        # update lobby registry and broadcast
        await LobbyConsumer.remove_member(self.room_id, self.channel_name)
        
        # Broadcast to room that someone left
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "broadcast",
                "message_type": "player_left",
                "data": {"room_id": self.room_id},
                "sender": "system",
            },
        )

        await self.channel_layer.group_send(
            LobbyConsumer.group_name,
            {
                "type": "broadcast",
                "message_type": "rooms",
                "data": await LobbyConsumer.snapshot_rooms(),
            },
        )

    async def receive_json(self, content: Dict[str, Any], **kwargs: Any):
        print("Received message:", content)
        message_type: str = str(content.get("type", "message"))
        data: Dict[str, Any] = content.get("data", {}) or {}
        sender: Optional[int] = None
        user = self.scope.get("user")
        if user and getattr(user, "is_authenticated", False):
            sender = getattr(user, "id", None)

        # Broadcast to room group
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "broadcast",  # maps to self.broadcast
                "message_type": message_type,
                "data": data,
                "sender": sender,
            },
        )

    async def broadcast(self, event: Dict[str, Any]):
        await self.send_json(
            {
                "type": event.get("message_type", "message"),
                "data": event.get("data", {}),
                "sender": event.get("sender"),
            }
        )


class LobbyConsumer(AsyncJsonWebsocketConsumer):

    LIVE_ROOMS: Dict[str, LiveRoom] = {}
    LIVE_ROOMS_LOCK = asyncio.Lock()

    group_name = "lobby"

    @classmethod
    async def create_room(cls, *, player_1: Optional[int] = None) -> LiveRoom:
        async with cls.LIVE_ROOMS_LOCK:
            # 8-char random id; retry if collision
            room_id = uuid.uuid4().hex[:8]
            while room_id in cls.LIVE_ROOMS:
                room_id = uuid.uuid4().hex[:8]
            room = LiveRoom(id=room_id, player_1=player_1)
            cls.LIVE_ROOMS[room_id] = room
            return room

    @classmethod
    async def add_member(cls, room_id: str, channel_name: str, user: Any = None) -> Dict[str, Any]:
        async with cls.LIVE_ROOMS_LOCK:
            room = cls.LIVE_ROOMS.get(room_id)
            if room is None:
                # create adhoc room if joined directly by id
                room = LiveRoom(id=room_id)
                cls.LIVE_ROOMS[room_id] = room
                logger.info(f"Created adhoc room {room_id}")
            room.members.add(channel_name)
            room.updated_at = timezone.now()
            logger.info(f"Room {room_id}: member {channel_name} joined. Members count: {len(room.members)}")

            if user and getattr(user, "is_authenticated", False):
                # Assign slots
                if room.player_1 == user.id:
                    pass
                elif room.player_2 == user.id:
                    pass
                elif room.player_1 is None:
                    room.player_1 = user.id
                elif room.player_2 is None:
                    room.player_2 = user.id
            
            return room.to_dict()

    @classmethod
    async def remove_member(cls, room_id: str, channel_name: str) -> None:
        async with cls.LIVE_ROOMS_LOCK:
            room = cls.LIVE_ROOMS.get(room_id)
            if room is None:
                logger.warning(f"Attempted to remove member from non-existent room {room_id}")
                return
            room.members.discard(channel_name)
            room.updated_at = timezone.now()
            logger.info(f"Room {room_id}: member {channel_name} left. Members count: {len(room.members)}")
            # delete room if empty
            if not room.members:
                del cls.LIVE_ROOMS[room_id]
                logger.info(f"Room {room_id} deleted because it is empty.")

    @classmethod
    async def snapshot_rooms(cls) -> List[Dict[str, Any]]:
        async with cls.LIVE_ROOMS_LOCK:
            # Cleanup empty rooms (zombies or just emptied)
            now = timezone.now()
            to_delete = []
            for rid, room in cls.LIVE_ROOMS.items():
                if not room.members:
                    # If empty, check age. 
                    # Give 10s grace period for creator to connect.
                    if (now - room.updated_at).total_seconds() > 10:
                        to_delete.append(rid)
            
            for rid in to_delete:
                del cls.LIVE_ROOMS[rid]
                logger.info(f"Deleted empty/zombie room {rid} during snapshot")

            return [room.to_dict() for room in cls.LIVE_ROOMS.values()]

    async def connect(self):
        print("Lobby sent initial rooms snapshot:")
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        # send current rooms list to the newly connected lobby client
        rooms = await self.snapshot_rooms()
        await self.send_json({"type": "rooms", "data": rooms})
        # log the snapshot on first connect
        logger.info("Lobby initial rooms snapshot on connect: %s", rooms)

    async def disconnect(self, code: int):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content: Dict[str, Any], **kwargs: Any):
        print("Lobby received message:", content)
        message_type: str = str(content.get("type", ""))
        if message_type == "create_room":
            user = self.scope.get("user")
            user_id = getattr(user, "id", None) if getattr(user, "is_authenticated", False) else None
            room = await self.create_room(player_1=user_id)
            await self.send_json({"type": "room_created", "data": room.to_dict()})
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "broadcast",
                    "message_type": "rooms",
                    "data": await self.snapshot_rooms(),
                },
            )
        else:
            pass

    async def broadcast(self, event: Dict[str, Any]):
        await self.send_json(
            {
                "type": event.get("message_type", "message"),
                "data": event.get("data", {}),
            }
        )


# class LobbyConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         logger.info("hello worlds")
#         await self.accept()
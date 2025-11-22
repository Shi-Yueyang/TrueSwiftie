# TrueSwiftie
A game project to test if you are a true swiftie

## Backend WebSockets (Django Channels)


Key files:
- `tsbackend/tsbackend/asgi.py` – ProtocolTypeRouter for HTTP + WebSocket
- `tsbackend/ts/routing.py` – WebSocket routes
- `tsbackend/ts/consumers.py` – `RoomConsumer` broadcasting within a room

Run locally (Daphne):

```bash
cd tsbackend
pipenv run daphne -b 0.0.0.0 -p 8001 tsbackend.asgi:application
```

Quick browser test (DevTools console):

```js
const ws = new WebSocket('ws://localhost:8000/ws/ts/dualmode/1/');
ws.onmessage = (e) => console.log('message:', e.data);
ws.onopen = () => ws.send(JSON.stringify({ type: 'chat', data: { text: 'hello' } }));
```
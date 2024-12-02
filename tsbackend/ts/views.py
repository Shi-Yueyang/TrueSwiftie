from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404
from .models import Song
from rest_framework import status
import os

class StreamSongView(APIView):
    def get(self,request,song_id, start_point):
        song = get_object_or_404(Song, id=song_id)

        file_path = song.file.path
        if not os.path.exists(file_path):
            return Response({"detail": "Song file not found."}, status=status.HTTP_404_NOT_FOUND)

        file_size = os.path.getsize(file_path)
        if start_point >= file_size:
            raise Http404("Start point is beyond the file size.")

        file = open(file_path, 'rb')
        file.seek(start_point)
        response = FileResponse(file)
        response['Content-Type'] = 'audio/mpeg'
        response['Content-Range'] = f'bytes {start_point}-{file_size - 1}/{file_size}'
        response['Accept-Ranges'] = 'bytes'
        response.status_code = 206  # Partial Content
        return response
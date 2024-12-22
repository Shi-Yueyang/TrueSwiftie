from django.middleware.csrf import get_token
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response

class CsrfTokenView(APIView):

    
    def get(self, request):
        csrf_token = get_token(request)
        return Response({'csrfToken': csrf_token})
from django.middleware.csrf import get_token
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken

class CsrfTokenView(APIView):
    def get(self, request):
        csrf_token = get_token(request)
        return Response({'csrfToken': csrf_token})
    
class AnonymousLoginView(APIView):
    def post(self,request):
        username = request.data.get('username')
        user = User.objects.create_user(username=username)
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
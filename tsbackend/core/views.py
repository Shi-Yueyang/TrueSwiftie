from django.middleware.csrf import get_token
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import CustomUser as User
from rest_framework_simplejwt.tokens import RefreshToken
import random
import string

class CsrfTokenView(APIView):
    def get(self, request):
        csrf_token = get_token(request)
        return Response({'csrfToken': csrf_token})
    
class TemporaryUserLoginView(APIView):
    def post(self,request):
        temporary_name = request.data.get('temporaryName')
        random_password = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
        duplication = 0
        while True:
            username = f"{temporary_name}_{duplication}" if duplication>0 else temporary_name
            if not User.objects.filter(username=username).exists():
                break
            duplication += 1
        user = User.objects.create_user(temporary_name=temporary_name,username=username,cat_name=random_password)
        user.set_password(random_password)
        refresh = RefreshToken.for_user(user)
            
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'temporary_name': temporary_name,
            'userId':user.pk
        })
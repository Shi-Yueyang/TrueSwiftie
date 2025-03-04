from django.middleware.csrf import get_token
from rest_framework.views import APIView
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import CustomUser as User
from .serializer import UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
import random
import string

class CsrfTokenView(APIView):
    def get(self, request):
        csrf_token = get_token(request)
        return Response({'csrfToken': csrf_token})
    
class TemporaryUserLoginView(APIView):
    def post(self,request):
        temporary_name = request.data.get('temporary_name')
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
    
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def create(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        user = request.user
        serializer = self.get_serializer(user)
        return Response(serializer.data)

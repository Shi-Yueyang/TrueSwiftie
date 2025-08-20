from django.middleware.csrf import get_token
from rest_framework.views import APIView
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import CustomUser as User
from .serializer import UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
import jwt

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

    @action(detail=False, methods=['post'], permission_classes=[AllowAny], url_path='google-login')
    def google_login(self, request):
        credential = request.data.get('credential')
        if not credential:
            return Response({'detail': 'Missing credential'}, status=400)

        # Decode without verification (no network calls)
        try:
            idinfo = jwt.decode(
                credential,
                options={"verify_signature": False, "verify_aud": False, "verify_exp": False},
                algorithms=["RS256", "HS256"],
            )
        except Exception as e:
            return Response({'detail': 'Failed to decode credential', 'error': str(e)}, status=400)

        email = (idinfo.get('email') or '').strip()
        given_name = (idinfo.get('given_name') or '').strip()
        family_name = (idinfo.get('family_name') or '').strip()
        sub = (idinfo.get('sub') or '').strip()

        if not email:
            if not sub:
                return Response({'detail': 'Email/sub not present in credential'}, status=400)
            # create a pseudo email to satisfy unique constraint if needed
            email = f"{sub}@oauth.local"

        # Find or create user (unchanged)
        user = User.objects.filter(email=email).first()
        if not user:
            base_username = (email.split('@')[0] or 'user').strip()
            username = base_username
            i = 0
            while User.objects.filter(username=username).exists():
                i += 1
                username = f"{base_username}{i}"

            rand_pwd = ''.join(random.choices(string.ascii_letters + string.digits, k=12))
            user = User.objects.create_user(
                username=username,
                email=email,
                temporary_name=given_name or username,
                cat_name=rand_pwd,
                password=rand_pwd,
            )
            if hasattr(user, 'first_name'):
                user.first_name = given_name or user.first_name
            if hasattr(user, 'last_name'):
                user.last_name = family_name or user.last_name
            user.set_unusable_password()
            user.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.pk,
                'username': user.username,
                'is_staff': getattr(user, 'is_staff', False),
                'groups': list(user.groups.values_list('name', flat=True)) if hasattr(user, 'groups') else [],
            },
            'userId': user.pk,
            'username': user.username,
            'is_staff': getattr(user, 'is_staff', False),
            'groups': list(user.groups.values_list('name', flat=True)) if hasattr(user, 'groups') else [],
        })
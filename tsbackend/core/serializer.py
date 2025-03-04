from rest_framework import serializers
from .models import CustomUser as User
from django.contrib.auth.models import Group

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    groups = serializers.SlugRelatedField(many=True, read_only=True, slug_field='name')

    class Meta:
        model = User
        fields = ('id','username','temporary_name', 'password','is_staff','groups')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            temporary_name=validated_data.get('temporary_name', ''),
            password=validated_data['password'],
        )
        formal_group, created = Group.objects.get_or_create(name='formal')
        user.groups.add(formal_group)
        
        return user
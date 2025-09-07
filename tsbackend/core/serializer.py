from rest_framework import serializers
from .models import CustomUser as User
from django.contrib.auth.models import Group

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    groups = serializers.SlugRelatedField(many=True, read_only=True, slug_field='name')
    avatar = serializers.ImageField(required=False, allow_null=True, use_url=True)

    class Meta:
        model = User
        fields = ('id','username','temporary_name', 'password','is_staff','groups','avatar')

    def create(self, validated_data):
        avatar = validated_data.pop('avatar', None)
        user = User.objects.create_user(
            username=validated_data['username'],
            temporary_name=validated_data.get('temporary_name', ''),
            password=validated_data['password'],
            **({'avatar': avatar} if avatar else {})
        )
        formal_group, created = Group.objects.get_or_create(name='formal')
        user.groups.add(formal_group)
        
        return user

    def update(self, instance, validated_data):
        avatar = validated_data.pop('avatar', None)
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if avatar is not None:
            instance.avatar = avatar
        if password:
            instance.set_password(password)
        instance.save()
        return instance    
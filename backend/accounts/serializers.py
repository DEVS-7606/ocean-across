from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'avatar_url', 'role', 'created_at']
        read_only_fields = ['id', 'email', 'created_at']

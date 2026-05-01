from rest_framework import serializers
from .models import Session
from accounts.serializers import UserSerializer


class SessionSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    is_booked = serializers.SerializerMethodField()
    bookings_count = serializers.SerializerMethodField()
    thumbnail_display = serializers.SerializerMethodField()

    class Meta:
        model = Session
        fields = [
            'id', 'creator', 'title', 'description', 'price',
            'datetime', 'duration_mins', 'capacity', 'spots_remaining',
            'thumbnail_url', 'thumbnail', 'thumbnail_display',
            'status', 'created_at', 'updated_at',
            'is_booked', 'bookings_count',
        ]
        read_only_fields = ['id', 'creator', 'spots_remaining', 'created_at', 'updated_at']

    def get_is_booked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.bookings.filter(user=request.user, status='confirmed').exists()
        return False

    def get_bookings_count(self, obj):
        return obj.bookings.filter(status='confirmed').count()

    def get_thumbnail_display(self, obj):
        if obj.thumbnail:
            request = self.context.get('request')
            host = request.get_host() if request else 'localhost'
            scheme = 'https' if request and request.is_secure() else 'http'
            return f"{scheme}://{host}/storage/{obj.thumbnail.name}"
        return obj.thumbnail_url or None


class SessionWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = [
            'title', 'description', 'price', 'datetime',
            'duration_mins', 'capacity', 'thumbnail', 'thumbnail_url', 'status',
        ]
        extra_kwargs = {
            'thumbnail': {'required': False},
            'thumbnail_url': {'required': False},
        }

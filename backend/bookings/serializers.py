from rest_framework import serializers
from .models import Booking
from sessions_app.serializers import SessionSerializer
from accounts.serializers import UserSerializer


class BookingSerializer(serializers.ModelSerializer):
    session = SessionSerializer(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = ['id', 'session', 'user', 'status', 'booked_at']
        read_only_fields = ['id', 'user', 'booked_at']

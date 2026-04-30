from django.core.exceptions import ValidationError
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from .models import Booking
from .serializers import BookingSerializer
from .services import BookingService


class BookingRateThrottle(UserRateThrottle):
    rate = '10/min'


class UserBookingListView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(
            user=self.request.user
        ).select_related('session__creator', 'user')


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([BookingRateThrottle])
def book_session(request, session_id):
    try:
        booking = BookingService.book_session(request.user, session_id)
    except PermissionError as e:
        return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
    except ValidationError as e:
        return Response({'error': str(e.message)}, status=status.HTTP_400_BAD_REQUEST)

    return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def cancel_booking(request, booking_id):
    try:
        BookingService.cancel_booking(request.user, booking_id)
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)

    return Response({'message': 'Booking cancelled.'})

from sessions_app.permissions import IsCreator


class CreatorBookingOverview(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsCreator]

    def get_queryset(self):
        return BookingService.get_creator_bookings(self.request.user)

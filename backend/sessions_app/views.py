from django.core.exceptions import PermissionDenied
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .models import Session
from .serializers import SessionSerializer, SessionWriteSerializer
from .permissions import IsCreator, IsSessionCreator
from .services import SessionService


class SessionListView(generics.ListAPIView):
    """Public session catalog — no auth required."""
    serializer_class = SessionSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return SessionService.get_public_catalog(
            search=self.request.query_params.get('search', '')
        )


class SessionDetailView(generics.RetrieveAPIView):
    """Public session detail — no auth required."""
    serializer_class = SessionSerializer
    permission_classes = [AllowAny]
    queryset = Session.objects.filter(status='published').select_related('creator')


class CreatorSessionListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsCreator]

    def get_serializer_class(self):
        return SessionWriteSerializer if self.request.method == 'POST' else SessionSerializer

    def get_queryset(self):
        return SessionService.get_creator_sessions(self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = SessionWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            session = SessionService.create_session(request.user, serializer.validated_data)
        except PermissionDenied as e:
            return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
        return Response(
            SessionSerializer(session, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )


class CreatorSessionDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsCreator, IsSessionCreator]

    def get_serializer_class(self):
        return SessionWriteSerializer if self.request.method in ('PUT', 'PATCH') else SessionSerializer

    def get_queryset(self):
        return Session.objects.filter(creator=self.request.user)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = SessionWriteSerializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        try:
            session = SessionService.update_session(
                request.user, instance.pk, serializer.validated_data
            )
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
        return Response(SessionSerializer(session, context={'request': request}).data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            SessionService.delete_session(request.user, instance.pk)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)


class CreatorBookingOverview(generics.ListAPIView):
    permission_classes = [IsCreator]

    def list(self, request, *args, **kwargs):
        from bookings.serializers import BookingSerializer
        from bookings.models import Booking
        bookings = Booking.objects.filter(
            session__creator=request.user
        ).select_related('session', 'user').order_by('-booked_at')
        return Response(BookingSerializer(bookings, many=True, context={'request': request}).data)

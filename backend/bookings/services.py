from django.db import transaction
from django.core.exceptions import ValidationError
from .models import Booking
from sessions_app.models import Session


class BookingService:
    """All booking business logic lives here. Views only call this."""

    @staticmethod
    def book_session(user, session_id: int) -> Booking:
        if user.role == 'creator':
            raise PermissionError("Creators cannot book sessions.")

        try:
            session = Session.objects.get(pk=session_id, status='published')
        except Session.DoesNotExist:
            raise ValueError("Session not found.")

        existing = Booking.objects.filter(session=session, user=user).first()
        if existing:
            if existing.status == 'confirmed':
                raise ValidationError("You have already booked this session.")
            raise ValidationError("You previously cancelled this booking and cannot rebook the same session.")

        with transaction.atomic():
            session = Session.objects.select_for_update().get(pk=session_id)
            if session.spots_remaining <= 0:
                raise ValidationError("No spots remaining.")

            booking = Booking.objects.create(session=session, user=user)
            session.spots_remaining -= 1
            session.save(update_fields=['spots_remaining'])

        return booking

    @staticmethod
    def cancel_booking(user, booking_id: int) -> Booking:
        try:
            booking = Booking.objects.select_related('session').get(
                pk=booking_id, user=user, status='confirmed'
            )
        except Booking.DoesNotExist:
            raise ValueError("Booking not found.")

        with transaction.atomic():
            booking.status = 'cancelled'
            booking.save(update_fields=['status'])

            session = Session.objects.select_for_update().get(pk=booking.session_id)
            session.spots_remaining += 1
            session.save(update_fields=['spots_remaining'])

        return booking

    @staticmethod
    def get_creator_bookings(creator):
        return Booking.objects.filter(
            session__creator=creator
        ).select_related('session', 'user').order_by('-booked_at')

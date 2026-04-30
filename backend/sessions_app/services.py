from django.core.exceptions import PermissionDenied
from core.service_exceptions import NotFoundError, CapacityError
from .models import Session


class SessionService:
    """All session business logic. Views stay thin."""

    @staticmethod
    def create_session(creator, data: dict) -> Session:
        if creator.role != 'creator':
            raise PermissionDenied("Only creators can create sessions.")
        return Session.objects.create(creator=creator, **data)

    @staticmethod
    def update_session(creator, session_id: int, data: dict) -> Session:
        try:
            session = Session.objects.get(pk=session_id, creator=creator)
        except Session.DoesNotExist:
            raise NotFoundError("Session not found or not owned by you.")

        new_capacity = data.get('capacity')
        if new_capacity is not None and new_capacity != session.capacity:
            booked = session.capacity - session.spots_remaining
            if new_capacity < booked:
                raise CapacityError(f'Cannot reduce capacity below {booked} (current bookings)')
            session.spots_remaining = new_capacity - booked

        for field, value in data.items():
            setattr(session, field, value)
        session.save()
        return session

    @staticmethod
    def delete_session(creator, session_id: int) -> None:
        try:
            session = Session.objects.get(pk=session_id, creator=creator)
        except Session.DoesNotExist:
            raise NotFoundError("Session not found or not owned by you.")
        session.delete()

    @staticmethod
    def get_public_catalog(search: str = '') -> 'QuerySet':
        qs = Session.objects.filter(status='published').select_related('creator')
        if search:
            qs = qs.filter(title__icontains=search)
        return qs

    @staticmethod
    def get_creator_sessions(creator) -> 'QuerySet':
        return Session.objects.filter(creator=creator).select_related('creator')

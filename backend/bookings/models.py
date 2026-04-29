from django.db import models
from django.conf import settings


class Booking(models.Model):
    STATUS_CHOICES = [('confirmed', 'Confirmed'), ('cancelled', 'Cancelled')]

    session = models.ForeignKey(
        'sessions_app.Session',
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='confirmed')
    booked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('session', 'user')
        ordering = ['-booked_at']

    def __str__(self):
        return f"{self.user.email} → {self.session.title}"

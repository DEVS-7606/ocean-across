from django.db import models
from django.conf import settings


class Session(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('cancelled', 'Cancelled'),
    ]

    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_sessions'
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    datetime = models.DateTimeField()
    duration_mins = models.PositiveIntegerField(default=60)
    capacity = models.PositiveIntegerField(default=10)
    spots_remaining = models.PositiveIntegerField()
    thumbnail_url = models.URLField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='published')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['datetime']

    def save(self, *args, **kwargs):
        if not self.pk:
            self.spots_remaining = self.capacity
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

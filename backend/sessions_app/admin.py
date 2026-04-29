from django.contrib import admin
from .models import Session


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ['title', 'creator', 'datetime', 'status', 'spots_remaining', 'price']
    list_filter = ['status']
    search_fields = ['title', 'creator__email']

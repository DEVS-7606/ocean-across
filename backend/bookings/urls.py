from django.urls import path
from . import views

urlpatterns = [
    path('', views.UserBookingListView.as_view(), name='user_bookings'),
    path('sessions/<int:session_id>/book/', views.book_session, name='book_session'),
    path('<int:booking_id>/cancel/', views.cancel_booking, name='cancel_booking'),
]

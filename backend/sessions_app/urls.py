from django.urls import path
from . import views

urlpatterns = [
    path('', views.SessionListView.as_view(), name='session_list'),
    path('<int:pk>/', views.SessionDetailView.as_view(), name='session_detail'),
    path('creator/', views.CreatorSessionListCreateView.as_view(), name='creator_sessions'),
    path('creator/bookings/', views.CreatorBookingOverview.as_view(), name='creator_bookings'),
    path('creator/<int:pk>/', views.CreatorSessionDetailView.as_view(), name='creator_session_detail'),
]

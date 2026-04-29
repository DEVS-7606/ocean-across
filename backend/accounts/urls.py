from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('oauth/redirect/', views.oauth_redirect, name='oauth_redirect'),
    path('me/', views.me, name='me'),
    path('profile/', views.update_profile, name='update_profile'),
    path('role/', views.set_role, name='set_role'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', views.logout_view, name='logout'),
]

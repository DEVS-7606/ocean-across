from django.shortcuts import redirect
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer
from .services import AuthService

FRONTEND_BASE = 'http://localhost'


def oauth_redirect(request):
    """
    social-django calls SOCIAL_AUTH_LOGIN_REDIRECT_URL after completing OAuth.
    The user is already authenticated in the Django session at this point.
    We issue JWT here and pass them to the frontend via query params.
    """
    user = request.user
    if not user.is_authenticated:
        return redirect(f'{FRONTEND_BASE}/?error=auth_failed')

    tokens = AuthService.issue_tokens(user)
    needs_role = not user.name or not user.role
    path = '/select-role' if needs_role else '/auth/callback'
    return redirect(f"{FRONTEND_BASE}{path}?access={tokens['access']}&refresh={tokens['refresh']}")


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(UserSerializer(request.user).data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    serializer = UserSerializer(request.user, data=request.data, partial=True)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = AuthService.update_profile(
        request.user,
        name=request.data.get('name', ''),
        avatar_url=request.data.get('avatar_url', ''),
    )
    return Response(UserSerializer(user).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def set_role(request):
    try:
        tokens = AuthService.set_role(request.user, request.data.get('role', ''))
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    return Response({'role': request.user.role, **tokens})


@api_view(['POST'])
@permission_classes([AllowAny])
def logout_view(request):
    try:
        token = RefreshToken(request.data.get('refresh'))
        token.blacklist()
        return Response({'message': 'Logged out successfully.'})
    except Exception:
        return Response({'error': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)

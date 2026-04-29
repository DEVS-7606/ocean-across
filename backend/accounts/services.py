from rest_framework_simplejwt.tokens import RefreshToken
from .models import User


class AuthService:
    """Auth business logic: token issuance, role assignment, profile updates."""

    @staticmethod
    def issue_tokens(user: User) -> dict:
        refresh = RefreshToken.for_user(user)
        refresh['role'] = user.role
        refresh['email'] = user.email
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

    @staticmethod
    def set_role(user: User, role: str) -> dict:
        if role not in ('user', 'creator'):
            raise ValueError(f"Invalid role: {role!r}. Must be 'user' or 'creator'.")
        user.role = role
        user.save(update_fields=['role'])
        return AuthService.issue_tokens(user)

    @staticmethod
    def update_profile(user: User, name: str = '', avatar_url: str = '') -> User:
        if name:
            user.name = name
        if avatar_url:
            user.avatar_url = avatar_url
        user.save(update_fields=['name', 'avatar_url'])
        return user

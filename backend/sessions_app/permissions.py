from rest_framework.permissions import BasePermission


class IsCreator(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'creator'


class IsSessionCreator(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.creator == request.user

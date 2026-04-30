from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import Throttled


def custom_exception_handler(exc, context):
    if isinstance(exc, Throttled):
        return Response({'error': 'Too many requests. Try again later.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)
    return exception_handler(exc, context)

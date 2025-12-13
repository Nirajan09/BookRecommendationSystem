# userprofile/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .serializers import UserSerializer

class UserProfileAPIView(APIView):
    """
    Retrieve and update the authenticated user's profile,
    including nested avatar uploads.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        data = request.data.copy()

        # Ensure nested profile exists
        if "profile" not in data:
            data["profile"] = {}

        # Merge uploaded file for avatar
        if "avatar" in request.FILES:
            data["profile"]["avatar"] = request.FILES["avatar"]

        serializer = UserSerializer(request.user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

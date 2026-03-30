from rest_framework import viewsets, permissions
from .models import Project, Room, FurnitureItem
from .serializers import ProjectSerializer, RoomSerializer, FurnitureItemSerializer
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class RoomViewSet(viewsets.ModelViewSet):
    serializer_class = RoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Room.objects.filter(project__user=self.request.user)

class FurnitureItemViewSet(viewsets.ModelViewSet):
    serializer_class = FurnitureItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FurnitureItem.objects.filter(room__project__user=self.request.user)
    
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, password=password, email=email)
    return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)
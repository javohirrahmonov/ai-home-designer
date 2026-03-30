from rest_framework import viewsets, permissions
from .models import Project, Room, FurnitureItem
from .serializers import ProjectSerializer, RoomSerializer, FurnitureItemSerializer
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
import os

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

from groq import Groq

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def ai_suggest(request):
    user_message = request.data.get('message')
    
    client = Groq(api_key=os.getenv('GROQ_API_KEY'))
    
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": """You are an interior design AI assistant. 
                When user describes what they want, suggest furniture items in JSON format like this:
                {
                    "suggestions": [
                        {"name": "Armchair", "type": "chair", "width": 60, "height": 60, "color": "#e74c3c", "description": "Comfortable armchair"},
                        {"name": "Coffee Table", "type": "table", "width": 80, "height": 50, "color": "#e67e22", "description": "Modern coffee table"}
                    ],
                    "advice": "I suggest placing the armchair near the window for natural light"
                }
                Only respond with valid JSON, nothing else."""
            },
            {
                "role": "user",
                "content": user_message
            }
        ],
        model="llama-3.3-70b-versatile",
    )
    
    import json
    response_text = chat_completion.choices[0].message.content
    response_data = json.loads(response_text)
    return Response(response_data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def get_or_create_project(request):
    project, created = Project.objects.get_or_create(
        user=request.user,
        defaults={'name': 'My Home'}
    )
    return Response({'id': project.id, 'name': project.name})
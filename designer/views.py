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
    existing_furniture = request.data.get('existing_furniture', [])
    existing_rooms = request.data.get('existing_rooms', [])

    context = f"""
Current room layout:
Rooms: {existing_rooms}
Existing furniture: {existing_furniture}
Canvas is 800x600 pixels.
"""

    client = Groq(api_key=os.getenv('GROQ_API_KEY'))

    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": """You are an interior design AI assistant.
                When user describes what they want, suggest furniture items in JSON format like this:
                {
                    "suggestions": [
                        {"name": "Armchair", "type": "chair", "width": 60, "height": 60, "color": "#e74c3c", "x": 150, "y": 200, "description": "Comfortable armchair near the bed"}
                    ],
                    "advice": "I placed the armchair 20px to the right of the bed"
                }
                Use the canvas context to calculate correct x and y coordinates based on existing furniture positions.
                Only respond with valid JSON, nothing else."""
            },
            {
                "role": "user",
                "content": f"{context}\n\nUser request: {user_message}"
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
    project = Project.objects.filter(user=request.user).first()
    if not project:
        project = Project.objects.create(user=request.user, name='My Home')
    return Response({'id': project.id, 'name': project.name})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def save_design(request):
    project = Project.objects.filter(user=request.user).first()
    if not project:
        project = Project.objects.create(user=request.user, name='My Home')
    
    # Delete old rooms and furniture
    Room.objects.filter(project=project).delete()
    
    # Save new rooms and furniture
    rooms_data = request.data.get('rooms', [])
    furniture_data = request.data.get('furniture', [])
    
    for room in rooms_data:
        new_room = Room.objects.create(
            project=project,
            name=room['name'],
            width=room['width'],
            height=room['height'],
            x=room['x'],
            y=room['y']
        )
        for item in furniture_data:
            FurnitureItem.objects.create(
                room=new_room,
                name=item['name'],
                x=item['x'],
                y=item['y'],
                width=item['width'],
                height=item['height'],
                color=item['fill']
            )
    
    return Response({'message': 'Design saved!'})
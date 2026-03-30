from rest_framework import serializers
from .models import Project, Room, FurnitureItem

class FurnitureItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FurnitureItem
        fields = '__all__'

class RoomSerializer(serializers.ModelSerializer):
    furniture_items = FurnitureItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Room
        fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
    rooms = RoomSerializer(many=True, read_only=True)
    
    class Meta:
        model = Project
        fields = '__all__'
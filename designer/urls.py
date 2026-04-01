from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, RoomViewSet, FurnitureItemViewSet, register, ai_suggest, get_or_create_project, save_design

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'rooms', RoomViewSet, basename='room')
router.register(r'furniture', FurnitureItemViewSet, basename='furniture')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', register, name='register'),
    path('ai/suggest/', ai_suggest, name='ai_suggest'),
    path('project/default/', get_or_create_project, name='get_or_create_project'),
    path('design/save/', save_design, name='save_design'),
]
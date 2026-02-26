from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WasteViewSet

router = DefaultRouter()
router.register(r'', WasteViewSet, basename='waste')

urlpatterns = [
    path('', include(router.urls)),
]

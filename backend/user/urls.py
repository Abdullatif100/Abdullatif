from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserRegistrationViewSet, UserProfileViewSet

router = DefaultRouter()
router.register(r'profile', UserProfileViewSet, basename='userprofile')
router.register(r'auth', UserRegistrationViewSet, basename='auth')

urlpatterns = [
    path('', include(router.urls)),
]

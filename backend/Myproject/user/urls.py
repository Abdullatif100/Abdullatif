from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import register_api, login_api, logout_api, UserprofileViewSet

router = DefaultRouter()
router.register(r'user', UserprofileViewSet, basename='userprofile')

urlpatterns = [
    path('register/', register_api, name='register_api'),
    path('login/', login_api, name='login_api'),
    path('logout/', logout_api, name='logout_api'),
] + router.urls

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReportWasteViewSet

router = DefaultRouter()
router.register(r'', ReportWasteViewSet, basename='report')

urlpatterns = [
    path('', include(router.urls)),
]

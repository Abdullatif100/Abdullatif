
'''from django.urls import path
from .views import waste_list


urlpatterns = [
path('waste/', waste_list, name='waste'),
]'''

from rest_framework.routers import DefaultRouter
from .views import WastetypeViewSet

router = DefaultRouter()

router.register(r'waste', WastetypeViewSet)

urlpatterns = router.urls
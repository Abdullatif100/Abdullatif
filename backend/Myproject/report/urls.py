'''from django.urls import path
from . import views

app_name = 'report'

urlpatterns = [
    path('', views.ReportwasteListView.as_view(), name='list'),
    path('<int:pk>/', views.ReportwasteDetailView.as_view(), name='detail'),
]
'''






'''from django.urls import path
from .views import report_waste, officer_reports


urlpatterns = [
path('report/', report_waste, name='report'),
path('officer/', officer_reports, name='officer_reports'),
]'''


from rest_framework.routers import DefaultRouter
from .views import ReportwasteViewSet

router = DefaultRouter()
router.register(r'report', ReportwasteViewSet)

urlpatterns = router.urls


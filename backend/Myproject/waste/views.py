'''from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import Wastetype


@login_required
def waste_list(request):
    wastes = Wastetype.objects.all()
    return render(request, 'waste/waste_list.html', {'wastes': wastes})'''

from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Wastetype
from .serializers import WastetypeSerializer

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.user.is_superuser or request.user.is_staff:
            return True
        try:
            profile = request.user.userprofile
            return profile.role == 'admin'
        except:
            return False

class WastetypeViewSet(viewsets.ModelViewSet):
    queryset = Wastetype.objects.all()
    serializer_class = WastetypeSerializer
    permission_classes = [IsAdmin]

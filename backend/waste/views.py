from rest_framework import viewsets, filters, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Waste
from .serializers import WasteSerializer

class WasteViewSet(viewsets.ModelViewSet):
    queryset = Waste.objects.all()
    serializer_class = WasteSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['waste_type', 'location']
    ordering_fields = ['created_at', 'status']

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        # Users see their own waste, officers see all
        user_profile = self.request.user.userprofile
        if user_profile.role == 'officer':
            return Waste.objects.all()
        return Waste.objects.filter(user=self.request.user)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        waste = self.get_object()
        new_status = request.data.get('status')
        if new_status in ['pending', 'collected', 'processed']:
            waste.status = new_status
            waste.save()
            return Response({'status': 'Status updated', 'new_status': new_status})
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

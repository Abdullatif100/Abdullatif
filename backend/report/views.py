from rest_framework import viewsets, filters, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ReportWaste
from .serializers import ReportWasteSerializer

class ReportWasteViewSet(viewsets.ModelViewSet):
    queryset = ReportWaste.objects.all()
    serializer_class = ReportWasteSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['waste_type', 'location']
    ordering_fields = ['created_at', 'status']

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        # Users see their own reports, officers see all
        user_profile = self.request.user.userprofile
        if user_profile.role == 'officer':
            return ReportWaste.objects.all()
        return ReportWaste.objects.filter(user=self.request.user)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        report = self.get_object()
        new_status = request.data.get('status')
        if new_status in ['pending', 'accepted', 'resolved']:
            report.status = new_status
            report.save()
            return Response({'status': 'Status updated', 'new_status': new_status})
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

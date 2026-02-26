from rest_framework import serializers
from .models import ReportWaste

class ReportWasteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportWaste
        fields = ['id', 'waste_type', 'description', 'location', 'image', 'status', 'created_at', 'user']
        read_only_fields = ['id', 'created_at', 'user']

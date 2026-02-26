from rest_framework import serializers
from .models import Waste

class WasteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Waste
        fields = ['id', 'waste_type', 'quantity', 'location', 'status', 'created_at', 'user']
        read_only_fields = ['id', 'created_at', 'user']

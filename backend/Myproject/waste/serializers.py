from rest_framework import serializers
from .models import Wastetype

class WastetypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wastetype
        fields = ['id', 'name', 'description']

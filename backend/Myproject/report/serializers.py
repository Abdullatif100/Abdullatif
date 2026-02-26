from rest_framework import serializers
from .models import Reportwaste
from django.contrib.auth.models import User

class ReportwasteSerializer(serializers.ModelSerializer):
    user_details = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Reportwaste
        fields = ['id', 'user', 'user_details', 'waste_type', 'location', 'description', 'image', 'status', 'time_created']
        read_only_fields = ['id', 'time_created', 'user', 'user_details']
    
    def get_user_details(self, obj):
        # Some legacy rows may have a broken/missing user relation.
        # Guard against RelatedObjectDoesNotExist so list endpoints don't 500.
        if not getattr(obj, 'user_id', None):
            return None
        try:
            user = obj.user
            return {
                'id': user.id,
                'username': user.username,
                'email': user.email,
            }
        except Exception:
            return None
        return None

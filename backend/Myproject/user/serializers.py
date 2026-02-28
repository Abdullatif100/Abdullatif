from rest_framework import serializers
from django.contrib.auth.models import User
from django.db import IntegrityError
from .models import Userprofile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class UserprofileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = Userprofile
        fields = ['id', 'user', 'user_id', 'phone_number', 'role']
        read_only_fields = ['id', 'user']

class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)
    phone_number = serializers.CharField(max_length=20, required=False, allow_blank=True)
    role = serializers.CharField(max_length=20, required=False, default='citizen')

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name', 'phone_number', 'role']
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match.")
        if data.get('role') not in ['citizen', 'officer', 'admin']:
            raise serializers.ValidationError("Invalid role.")
        if User.objects.filter(username__iexact=data['username']).exists():
            raise serializers.ValidationError({'username': 'Username already exists.'})
        email = data.get('email', '').strip()
        if email and User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError({'email': 'Email already exists.'})
        return data
    
    def create(self, validated_data):
        validated_data.pop('password2')
        phone_number = validated_data.pop('phone_number', '')
        role = validated_data.pop('role', 'citizen')
        try:
            user = User.objects.create_user(**validated_data)
        except IntegrityError:
            raise serializers.ValidationError({'username': 'Username already exists.'})
        Userprofile.objects.create(user=user, phone_number=phone_number, role=role)
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from django.db import IntegrityError
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from .models import Userprofile
from report.models import Reportwaste

from rest_framework import viewsets, status, serializers
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """
    Custom permission to only allow admins.
    """

    def has_permission(self, request, view):
        if request.user and request.user.is_authenticated:
            if request.user.is_superuser or request.user.is_staff:
                return True
            try:
                profile = request.user.userprofile
                return profile.role == 'admin'
            except:
                return False
        return False

    def has_object_permission(self, request, view, obj):
        if request.user and request.user.is_authenticated:
            if request.user.is_superuser or request.user.is_staff:
                return True
            try:
                profile = request.user.userprofile
                return profile.role == 'admin'
            except:
                return False
        return False
from .serializers import (
    UserprofileSerializer, 
    RegisterSerializer, 
    UserSerializer,
    LoginSerializer
)

# Legacy Django views (commented out but kept for reference)
def register_view(request):
    error = None
    if request.method == 'POST':
        try:
            user = User.objects.create_user(
                username=request.POST['username'],
                email=request.POST['email'],
                password=request.POST['password'],
                first_name=request.POST['first_name'],
                last_name=request.POST['last_name']
            )
            role = request.POST.get('role')
            Userprofile.objects.create(user=user, role=role)
            return redirect('/login/')
        except IntegrityError:
            error = "Username or email already exists. Please choose a different one."
    return render(request, 'user/register.html', {'error': error})

@login_required
def dashboard_view(request):
    try:
        profile = Userprofile.objects.get(user=request.user)
        role = profile.role
    except Userprofile.DoesNotExist:
        # Create profile for new users
        profile = Userprofile.objects.create(user=request.user, role='citizen')
        role = profile.role

    if request.method == 'POST' and role == 'officer':
        for key, value in request.POST.items():
            if key.startswith('status_'):
                report_id = key.split('_')[1]
                try:
                    report = Reportwaste.objects.get(id=report_id)
                    report.status = value
                    report.save()
                except Reportwaste.DoesNotExist:
                    pass
        return redirect('/dashboard/')

    if role == 'citizen':
        reports = Reportwaste.objects.filter(user=request.user)
        context = {'reports': reports, 'role': 'citizen'}
    elif role == 'officer':
        reports = Reportwaste.objects.all()
        context = {'reports': reports, 'role': 'officer'}
    else:
        return redirect('/')

    return render(request, 'user/dashboard.html', context)

def login_view(request):
    error = None
    if request.method == 'POST':
        user = authenticate(
            request,
            username=request.POST['username'],
            password=request.POST['password']
        )
        if user:
            login(request, user)
            try:
                profile = Userprofile.objects.get(user=user)
                role = profile.role
            except Userprofile.DoesNotExist:
                role = 'citizen'  # default
            if user.is_staff or user.is_superuser:
                return redirect('/admin/')
            else:
                return redirect('/dashboard/')
        else:
            error = "Invalid username or password."
    return render(request, 'user/login.html', {'error': error})

# REST API Views
@csrf_exempt
@api_view(['POST'])
def register_api(request):
    """User registration endpoint - creates user and profile"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        return Response(
            {
                'message': 'User registered successfully',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                },
                'role': request.data.get('role', 'citizen')
            },
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from rest_framework_simplejwt.tokens import RefreshToken

@csrf_exempt
@api_view(['POST'])
def login_api(request):
    """User login endpoint"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        
        user = authenticate(username=username, password=password)
        if user is not None:
            login(request, user)
            # Superuser/staff should always behave as admin in API + frontend.
            if user.is_superuser or user.is_staff:
                role = 'admin'
                profile, _ = Userprofile.objects.get_or_create(
                    user=user,
                    defaults={'role': 'admin', 'phone_number': ''}
                )
                if profile.role != 'admin':
                    profile.role = 'admin'
                    profile.save(update_fields=['role'])
            else:
                try:
                    profile = Userprofile.objects.get(user=user)
                    role = profile.role
                except Userprofile.DoesNotExist:
                    # Create profile for new users
                    profile = Userprofile.objects.create(user=user, role='citizen', phone_number='')
                    role = profile.role
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response(
                {
                    'message': 'Login successful',
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                    },
                    'role': role,
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    }
                },
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['POST'])
def logout_api(request):
    """User logout endpoint"""
    from django.contrib.auth import logout
    logout(request)
    return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)

class UserprofileViewSet(viewsets.ModelViewSet):
    queryset = Userprofile.objects.all()
    serializer_class = UserprofileSerializer
    permission_classes = [IsAdmin]
    
    def perform_create(self, serializer):
        """Override to set user from request"""
        # If user_id is provided in the request, use it
        user_id = self.request.data.get('user')
        if user_id:
            try:
                user = User.objects.get(id=user_id)
                serializer.save(user=user)
            except User.DoesNotExist:
                raise serializers.ValidationError({'user': 'User not found'})
        else:
            # Otherwise use authenticated user
            serializer.save(user=self.request.user)

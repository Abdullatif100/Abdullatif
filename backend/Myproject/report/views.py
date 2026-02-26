
'''from django.shortcuts import render, get_object_or_404
from django.views.generic import ListView, DetailView
from .models import Reportwaste

class ReportwasteListView(ListView):
    model = Reportwaste
    template_name = 'report/reportwaste_list.html'
    context_object_name = 'reports'

class ReportwasteDetailView(DetailView):
    model = Reportwaste
    template_name = 'report/reportwaste_detail.html'
    context_object_name = 'report'
'''








'''from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Reportwaste


@login_required
def report_waste(request):
    if request.method == 'POST':
        location = request.POST.get('location')
        waste_type = request.POST.get('waste_type')
        description = request.POST.get('description')
        image = request.FILES.get('image')
        if location and waste_type and description:
            Reportwaste.objects.create(location=location, waste_type=waste_type, user=request.user, description=description, image=image)
            messages.success(request, 'Report submitted successfully!')
            return redirect('report')
        else:
            messages.error(request, 'Please fill all required fields.')
    return render(request, 'report/report.html')


@login_required
def officer_reports(request):
    from user.models import Userprofile
    try:
        profile = Userprofile.objects.get(user=request.user)
        if profile.role != 'officer':
            return redirect('/')
    except Userprofile.DoesNotExist:
        return redirect('/')
    
    reports = Reportwaste.objects.all()
    if request.method == 'POST':
        report_id = request.POST.get('report_id')
        new_status = request.POST.get('status')
        if report_id and new_status:
            report = Reportwaste.objects.get(id=report_id)
            report.status = new_status
            report.save()
            return redirect('officer_reports')
    return render(request, 'report/officer_reports.html', {'reports': reports})'''



from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Reportwaste
from .serializers import ReportwasteSerializer
from .permissions import IsAdminOrReadOnly

class ReportwasteViewSet(viewsets.ModelViewSet):
    queryset = Reportwaste.objects.all()
    serializer_class = ReportwasteSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            if user.is_superuser or user.is_staff:
                return Reportwaste.objects.all()
            try:
                from user.models import Userprofile
                profile = Userprofile.objects.get(user=user)
                if profile.role in ['officer', 'admin']:
                    return Reportwaste.objects.all()
                else:
                    return Reportwaste.objects.filter(user=user)
            except Userprofile.DoesNotExist:
                return Reportwaste.objects.filter(user=user)
        return Reportwaste.objects.none()
    
    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            raise PermissionDenied('Authentication is required to submit a report.')

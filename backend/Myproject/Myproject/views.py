from django.shortcuts import render, redirect
from django.views import View
from report.models import Reportwaste
from waste.models import Wastetype

class HomeView(View):
    def get(self, request):
        # If the user is not authenticated, redirect them to the login page
        if not request.user.is_authenticated:
            return redirect('user:login')

        total_reports = Reportwaste.objects.count()
        pending_reports = Reportwaste.objects.filter(status='pending').count()
        resolved_reports = Reportwaste.objects.filter(status='resolved').count()
        waste_types = Wastetype.objects.count()
        
        context = {
            'total_reports': total_reports,
            'pending_reports': pending_reports,
            'resolved_reports': resolved_reports,
            'waste_types': waste_types,
        }
        return render(request, 'home.html', context)

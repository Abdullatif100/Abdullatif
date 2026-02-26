from django.db import models
from django.contrib.auth.models import User

class Reportwaste(models.Model):
    STATUS_CHOICES = (
        ('pending','Pending'),
        ('in_progress','In Progress'),
        ('resolved','Resolved'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    waste_type = models.CharField(max_length=100)
    location = models.CharField(max_length = 100)
    description = models.TextField()
    image = models.ImageField(upload_to='reports/',blank=True, null=True)
    status = models.CharField(max_length=25, choices=STATUS_CHOICES,default='pending')
    time_created=models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.waste_type}-{self.location}"
    

# Create your models here.

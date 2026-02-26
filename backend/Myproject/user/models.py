from django.contrib.auth.models import User
from django.db import models

class Userprofile(models.Model):
    ROLE_CHOICES = (
        ('citizen','Citizen'),
        ('officer','Officer'),
        ('admin','Admin'),
    )

    user = models.OneToOneField(User,on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=20)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    def __str__(self):
        return self.user.username

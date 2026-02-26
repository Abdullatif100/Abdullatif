import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Myproject.settings')
django.setup()

import requests
import json

test_data = {
    "username": "testuser_new",
    "email": "testnew@example.com",
    "password": "TestPass123!",
    "first_name": "Test",
    "last_name": "User",
    "phone_number": "+255123456789",
    "role": "citizen"
}

print("Testing registration endpoint...")
print(f"Sending: {json.dumps(test_data, indent=2)}")

response = requests.post(
    'http://localhost:8000/api/user/register/',
    json=test_data,
    headers={'Content-Type': 'application/json'}
)

print(f"\nStatus Code: {response.status_code}")
print(f"Response: {response.text}")

if response.status_code != 201:
    try:
        error_data = response.json()
        print(f"\nDetailed error:")
        print(json.dumps(error_data, indent=2))
    except:
        print("Could not parse error response")

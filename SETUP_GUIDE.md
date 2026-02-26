# Waste Management Project - Setup & Running Guide

## Project Structure
- **Backend**: Django REST API (Python)
- **Frontend**: React with Vite (JavaScript)

## Backend Setup

### Prerequisites
- Python 3.8+
- pip

### Installation & Running

1. Navigate to backend directory:
```bash
cd backend/Myproject
```

2. Activate virtual environment:
```bash
# Windows
env\Scripts\activate

# macOS/Linux
source ../env/bin/activate
```

3. Install dependencies (if not already installed):
```bash
pip install -r requirements.txt
```

4. Run migrations:
```bash
python manage.py migrate
```

5. Create a superuser (admin account):
```bash
python manage.py createsuperuser
```

6. Start the development server:
```bash
python manage.py runserver
```

The backend will run on: **http://localhost:8000**

### Admin Panel
Access Django admin at: **http://localhost:8000/admin/**

## Frontend Setup

### Prerequisites
- Node.js 16+
- npm

### Installation & Running

1. Navigate to frontend directory:
```bash
cd frontend/MyRProject
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

The frontend will run on: **http://localhost:5173**

## API Endpoints

### Authentication
- `POST /api/user/register/` - Register new user
- `POST /api/user/login/` - Login user
- `POST /api/user/logout/` - Logout user

### User Profiles
- `GET /api/user/user/` - List all user profiles
- `POST /api/user/user/` - Create user profile
- `GET /api/user/user/{id}/` - Get user profile
- `PUT /api/user/user/{id}/` - Update user profile
- `DELETE /api/user/user/{id}/` - Delete user profile

### Waste Types
- `GET /api/waste/waste/` - List waste types
- `POST /api/waste/waste/` - Create waste type
- `GET /api/waste/waste/{id}/` - Get waste type
- `PUT /api/waste/waste/{id}/` - Update waste type
- `DELETE /api/waste/waste/{id}/` - Delete waste type

### Reports
- `GET /api/report/report/` - List reports
- `POST /api/report/report/` - Create report
- `GET /api/report/report/{id}/` - Get report
- `PUT /api/report/report/{id}/` - Update report status
- `DELETE /api/report/report/{id}/` - Delete report

## User Roles

1. **Citizen**
   - Can report waste
   - Can view their own reports
   - Can see report status

2. **Officer**
   - Can view all reports
   - Can update report status (pending → in_progress → resolved)

3. **Admin**
   - Has full access to Django admin panel
   - Can manage waste types
   - Can manage all users and reports

## Features

- User authentication and registration
- Role-based access control
- Report waste with photos
- Real-time status tracking
- Officer dashboard for managing reports
- Rest API for future integrations

## Troubleshooting

### CORS Issues
If you get CORS errors, check that `CORS_ALLOWED_ORIGINS` in `backend/Myproject/settings.py` includes your frontend URL.

### Port Already in Use
- Django: Change port with `python manage.py runserver 8001`
- React: Change port in `vite.config.js` or set `VITE_PORT` environment variable

### API Connection Issues
- Ensure backend is running on `http://localhost:8000`
- Check that API base URL in `frontend/MyRProject/src/services/api.js` is correct

## Development Tips

### Adding New Waste Types
1. Go to Django admin: http://localhost:8000/admin/
2. Login with your superuser account
3. Add waste types under "Waste" app

### Testing the API
Use Postman or cURL to test API endpoints:
```bash
# Login
curl -X POST http://localhost:8000/api/user/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"your_username","password":"your_password"}'

# Get reports
curl http://localhost:8000/api/report/report/ \
  -H "Cookie: sessionid=your_session_id"
```

## Database

The project uses SQLite by default (stored in `backend/Myproject/db.sqlite3`).
For production, consider switching to PostgreSQL or MySQL in settings.py.

## Next Steps

1. Start both backend and frontend servers
2. Open http://localhost:5173 in your browser
3. Register a new account
4. Create a waste report
5. Check the dashboard

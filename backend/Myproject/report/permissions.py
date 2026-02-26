from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admins to edit or delete.
    Citizens can create, officers can update status but not delete.
    """

    def has_permission(self, request, view):
        if request.user and request.user.is_authenticated and (request.user.is_superuser or request.user.is_staff):
            return True
        if request.method in permissions.SAFE_METHODS:
            return True
        # For POST (create), allow authenticated users (citizens or users without profile)
        if request.method == 'POST':
            if request.user and request.user.is_authenticated:
                try:
                    profile = request.user.userprofile
                    return profile.role == 'citizen'
                except:
                    # Allow if user is authenticated but has no profile - treat as citizen
                    return True
            return False
        return True

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated

        if request.user and request.user.is_authenticated and (request.user.is_superuser or request.user.is_staff):
            return True

        # Get user profile
        try:
            profile = request.user.userprofile
        except:
            return False

        if profile.role == 'admin':
            return True  # Admins can do anything

        if profile.role == 'officer':
            # Officers can update (PATCH/PUT) but not delete
            if request.method in ['PATCH', 'PUT']:
                # Allow only status updates
                if 'status' in request.data and len(request.data) == 1:
                    return True
            return False

        if profile.role == 'citizen':
            # Citizens can only update their own reports? But according to user, citizens submit, but maybe not update.
            # The user said officers and admin can set status, but didn't mention citizens updating.
            # Probably citizens can't update after submission.
            return False

        return False

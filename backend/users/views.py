from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from .serializers import RegisterSerializer, UserSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/"""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """POST /api/auth/login/  (accepts username or email + password)"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        identifier = request.data.get('username') or request.data.get('email')
        password = request.data.get('password')

        if not identifier or not password:
            return Response(
                {'detail': 'Username/email and password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(username=identifier, password=password)
        if user is None:
            # allow login via email too
            try:
                found = User.objects.get(email=identifier)
                user = authenticate(username=found.username, password=password)
            except User.DoesNotExist:
                user = None

        if user is None:
            return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })


class LogoutView(APIView):
    """POST /api/auth/logout/  (blacklists the refresh token)"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception:
            pass
        return Response({'detail': 'Logged out successfully.'}, status=status.HTTP_200_OK)


class MeView(generics.RetrieveUpdateAPIView):
    """GET/PUT/PATCH /api/auth/me/ - current user's profile"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserListView(generics.ListAPIView):
    """GET /api/auth/users/ - admin only"""
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE /api/auth/users/<id>/ - admin only"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

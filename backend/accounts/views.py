import requests
from django.conf import settings
from django.db.models import Count
from django.http import JsonResponse
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt import tokens
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.exceptions import ValidationError
from core.serializers import ListingSerializer
from core.models import Listing, Booking
from core.authenticate import CustomAuthentication

from .models import User
from .serializers import (MyTokenObtainPairSerializer, RegistrationSerializer,
                          UserSerializer)


class LoginRateThrottle(AnonRateThrottle):
    rate = '5/hour'

class MyTokenObtainPairView(TokenObtainPairView):
    """
    Custom token obtain pair view for setting cookies on successful token retrieval.
    """

    serializer_class = MyTokenObtainPairSerializer
    throttle_classes = [LoginRateThrottle]

    def post(self, request, *args, **kwargs):
        """
        Handle POST request for token generation.

        This method overrides the default post method of TokenObtainPairView to set cookies
        for access and refresh tokens if the request is successful.

        Args:
            request (HttpRequest): The request object.
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.

        Returns:
            Response: The HTTP response.
        """

        # Call the super method to perform default token generation
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            access_token = response.data.pop('access', None)
            refresh_token = response.data.pop('refresh', None)
            # Set httponly flag for access and refresh tokens
            response.set_cookie(
                key=settings.SIMPLE_JWT['AUTH_COOKIE'],
                value=access_token,
                expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
            )
            response.set_cookie(
                key=settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'],
                value=refresh_token,
                expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
            )
        return response

class RegistrationView(generics.CreateAPIView):
    """
    Custom registration view for creating user accounts and setting authentication cookies.
    """

    serializer_class = RegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            if serializer.is_valid(raise_exception=True):
                serializedData = serializer.save(validated_data=serializer.validated_data)
                response = Response({
                    'id': serializedData['id'],
                    'first_name': serializedData['first_name'],
                    'last_name': serializedData['last_name'],
                    'email': serializedData['email'],
                    'profile_picture': serializedData['profile_picture'],
                }, status=status.HTTP_201_CREATED)
                access_token = serializedData.get('access_token')
                refresh_token = serializedData.get('refresh_token')
                response.set_cookie(
                        key=settings.SIMPLE_JWT['AUTH_COOKIE'],
                        value=access_token,
                        expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
                        secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                        httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                        samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
                )
                response.set_cookie(
                       key=settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'],
                       value=refresh_token,
                       expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
                       secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                       httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                       samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
                )
                return response
        except ValidationError as e:
            if 'email' in e.detail and 'already exists' in str(e.detail['email']):
                return Response(
                    {"error": "A user with this email already exists."},
                    status=status.HTTP_409_CONFLICT
                )
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    """
    Custom view for logging out users by blacklisting refresh tokens and deleting cookies.
    """

    def post(self, request):
        """
        Handle POST request for logging out users.

        This method blacklists the refresh token, deletes authentication cookies,
        and returns a response indicating successful logout.

        Args:
            request (HttpRequest): The request object.

        Returns:
            Response: The HTTP response.
        """

        try:
            refreshToken = request.COOKIES.get(
                settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])
            # Instantiate a RefreshToken object
            token = tokens.RefreshToken(refreshToken)
            token.blacklist()

            response = Response({'LoggedOut'})
            # Delete authentication cookies
            response.delete_cookie(settings.SIMPLE_JWT['AUTH_COOKIE'])
            response.delete_cookie(settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])

            return response

        except tokens.TokenError as e:
            # If there's a TokenError, still construct a response and delete cookies
            response = Response({'LoggedOut'})
            response.delete_cookie(settings.SIMPLE_JWT['AUTH_COOKIE'])
            response.delete_cookie(settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])
        
            return response
        except Exception as e:
            raise exceptions.ParseError("Invalid token")

class UserWishListView(generics.GenericAPIView):
    """
    API endpoint for retrieving and managing a user's wish list.
    """

    authentication_classes = [CustomAuthentication]
    serializer_class = ListingSerializer

    def get(self, request, *args, **kwargs):
        wish_list = request.user.wish_list.all()
        serializer = self.get_serializer(wish_list, many=True)
        return Response({'wish_list': serializer.data}, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        listing_id = request.data.get('listing_id')
        if not listing_id:
            return Response({'error': 'Listing ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            listing = Listing.objects.get(id=listing_id)
        except Listing.DoesNotExist:
            return Response({'error': 'Listing not found'}, status=status.HTTP_404_NOT_FOUND)

        if listing in request.user.wish_list.all():
            request.user.wish_list.remove(listing)
            action = 'removed from'
        else:
            request.user.wish_list.add(listing)
            action = 'added to'

        serializer = self.get_serializer(request.user.wish_list, many=True)

        return Response({
            'message': f'Listing {action} wish list',
            'wish_list': serializer.data
        }, status=status.HTTP_200_OK)

class UserPropertyListView(generics.ListAPIView):
    authentication_classes = [CustomAuthentication]
    serializer_class = ListingSerializer

    def get_queryset(self):
        user = self.request.user
        listings = Listing.objects.filter(creator=user)
        return listings

class UserReservationListView(generics.ListAPIView):
    authentication_classes = [CustomAuthentication]
    serializer_class = ListingSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            try:
                bookings = Booking.objects.filter(host=user).select_related('customer', 'host', 'listing')
                return bookings
            except Exception as e:
                print(e)
                return Response({
                    'error': 'An error occurred while retrieving bookings'
                }, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

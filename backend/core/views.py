import json

import cloudinary.uploader
from core.authenticate import CustomAuthentication
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, status, viewsets
from rest_framework.exceptions import ParseError
from rest_framework.filters import SearchFilter
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Booking, Listing
from .serializers import BookingSerializer, ListingSerializer


class ListingViewSet(viewsets.ModelViewSet):
    queryset = Listing.objects.all()
    serializer_class = ListingSerializer
    authentication_classes = [CustomAuthentication]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['category']

    def create(self, request, *args, **kwargs):
        # print(request.data)
        try:
            data = request.data.copy()
            data['creator'] = request.user.id

            # Handle file uploads
            listing_photos = request.FILES.getlist('listingPhotos')
            photo_urls = []

            for photo in listing_photos:
                # Upload each photo to Cloudinary
                result = cloudinary.uploader.upload(photo)
                photo_urls.append(result['url'])

            # Convert photo_urls list to JSON string
            data['listing_photo_paths'] = json.dumps(photo_urls)

            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ParseError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(e)
            return Response({
                'error': 'An error occurred during listing creation.'
            }, status=status.HTTP_400_BAD_REQUEST)

class ListingSearchView(APIView):

    def get(self, request, search=None):
        try:
            if search is None or search.lower() == "all":
                listings = Listing.objects.select_related('creator').all()
            else:
                print(f"Search term: {search}")  # Debugging
                listings = Listing.objects.filter(
                    Q(category__icontains=search) | Q(title__icontains=search)
                ).select_related('creator')
                print(f"Filtered listings: {listings}")  # Debugging
            
            serializer = ListingSerializer(listings, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            return Response({
                'error': 'An error occurred while searching for listings'
            }, status=status.HTTP_400_BAD_REQUEST)


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    authentication_classes = [CustomAuthentication]

    def list(self, request):
        try:
            user = request.user
            if user.is_authenticated:
                bookings = Booking.objects.filter(customer=user).select_related('customer', 'host', 'listing')
                serializer = self.get_serializer(bookings, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            print(e)
            return Response({
                'error': 'An error occurred while retrieving bookings'
            }, status=status.HTTP_400_BAD_REQUEST)

    def create(self, request):
        try:
           user = request.user
           data = request.data.copy()
           data['customer'] = user.id
           serializer = self.get_serializer(data=data)
           serializer.is_valid(raise_exception=True)
           user.trip_list.set(data['listing'])
           user.save()
           serializer.save()
           return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(e)
            return Response({
                'error': 'An error occured during booking creation'
            }, status=status.HTTP_400_BAD_REQUEST)

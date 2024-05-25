import json

import cloudinary.uploader
from core.authenticate import CustomAuthentication
from rest_framework import status, viewsets
from rest_framework.exceptions import ParseError
from rest_framework.response import Response

from .models import Listing
from .serializers import ListingSerializer
from django_filters.rest_framework import DjangoFilterBackend


class ListingViewSet(viewsets.ModelViewSet):
    queryset = Listing.objects.all()
    serializer_class = ListingSerializer
    authentication_classes = [CustomAuthentication]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['category']

    # def get_queryset(self):
    #     category = self.request.query_params.get('category', '')
    #     if category:
    #         listings = Listing.objects.filter(category=category)
    #     return category

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
            return Response({'error': 'An error occurred during listing creation.'}, status=status.HTTP_400_BAD_REQUEST)

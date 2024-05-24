from rest_framework import serializers
from .models import Listing


class ListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Listing
        fields = '__all__'

    def validate(self, data):
        # Ensure that at least one photo is provided
        if 'listing_photo_paths' not in data or not data['listing_photo_paths']:
            raise serializers.ValidationError("At least one photo is required for creating a listing.")
        
        return data

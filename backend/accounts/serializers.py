from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from cloudinary.utils import cloudinary_url


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model.

    This serializer is used to serialize User objects.
    """

    class Meta:
        model = User
        fields = [
            'id',
            'first_name',
            'last_name',
            'email',
            'profile_picture',
        ]

    def get__id(self, obj):
        """Get the id field value."""
        return obj.id

    def update(self, instance, validated_data):
        """
        Update the user profile.

        This method overrides the default update method to handle file upload for the profile picture.
        """
        # Get the file data from the request
        file = self.context['request'].FILES.get('file')
        user = super().update(instance, validated_data)
        if file:
            # Assign the file data to the user's profile picture then save it.
            user.profile_picture = file
            user.save()
        return user

    def to_representation(self, instance):
        """
        Convert the Post instance to a representation.

        This method overrides the default to_representation method to include the file URL.
        """

        representation = super().to_representation(instance)
        if instance.profile_picture:
            # Add the file URL to the representation
            representation['profile_picture'] = cloudinary_url(instance.profile_picture.public_id)[0]
        return representation

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom token obtain pair serializer.

    This serializer is used to add additional user data to the token obtain pair response.
    """

    def validate(self, attrs):
        """
        Validate the token obtain pair serializer data.

        This method adds additional user data to the token obtain pair response.

        Args:
            attrs (dict): The serializer data.

        Returns:
            dict: The validated data.
        """

        data = super().validate(attrs)
        serializer = UserSerializer(self.user).data
        for k, v in serializer.items():
            data[k] = v
        return data

class RegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.

    This serializer is used to create user accounts.
    """

    password = serializers.CharField(write_only=True, required=True)
    confirmPassword = serializers.CharField(write_only=True, required=True)
    profile_picture = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            'id', 
            'first_name', 
            'last_name', 
            'profile_picture',
            'email', 
            'password', 
            'confirmPassword', 
        ]
        read_only_fields = ['id']

    def validate(self, data):
        if data['password'] != data['confirmPassword']:
            raise serializers.ValidationError("Passwords do not match.")
        return data

    def save(self, validated_data):
        validated_data.pop('confirmPassword')
        profile_picture = validated_data.pop('profile_picture', None)
        user = User.objects.create(**validated_data)
        user.set_password(validated_data['password'])
        
        if profile_picture:
            user.profile_picture = profile_picture
            user.save() 

        validated_data['id'] = user.id

        refresh_token = RefreshToken.for_user(user)
        access_token = str(refresh_token.access_token)
        validated_data['access_token'] = access_token
        validated_data['refresh_token'] = refresh_token

        if user.profile_picture:
            validated_data['profile_picture'] = user.profile_picture.url

        return validated_data

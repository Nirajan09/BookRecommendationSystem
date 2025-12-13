# userprofile/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile

class ProfileSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Profile
        fields = ["avatar"]

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()

    class Meta:
        model = User
        fields = ["username", "email", "first_name", "last_name", "profile", "date_joined"]

    def update(self, instance, validated_data):
    # Update user fields
        profile_data = validated_data.pop("profile", {})
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update profile fields
        profile = instance.profile
        # Check root-level avatar if not in profile_data
        avatar = profile_data.get("avatar") or self.context.get("avatar")
        if avatar:
            profile.avatar = avatar
            profile.save()
        return instance

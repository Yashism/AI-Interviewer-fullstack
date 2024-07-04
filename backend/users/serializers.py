from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer as TokenObtainSerializer,
)
from rest_framework import serializers
from .utils import get_pclaim
from users.models import User
from django.db.models import Q


class TokenObtainPairSerializer(TokenObtainSerializer):
    """
    Custom TokenObtainPairSerializer class that will add username to the token payload
    This can then be decoded by client to use the available data
    """

    DEVICE_CHOICES = (
        ("android", "android"),
        ("ios", "ios"),
        ("web", "web"),
    )
    fcm_token = serializers.CharField(max_length=500)
    fcm_type = serializers.ChoiceField(DEVICE_CHOICES)

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username
        token["pclaim"] = get_pclaim(user)
        return token

    def validate(self, attrs):
        username = attrs.get("username")
        user = User.objects.filter(
            Q(username=username) | Q(email=username)
        ).first()
        refresh = self.get_token(user)
        data = {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }
        return data

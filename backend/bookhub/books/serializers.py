from rest_framework import serializers
from .models import Book
from .models import CartItem
from .models import WishlistItem

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = "__all__"

class CartItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartItem
        fields = ['id', 'user', 'book', 'quantity', 'added_at']
        read_only_fields = ['id', 'user', 'added_at']  # <-- add 'user' here

class WishlistItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = WishlistItem
        fields = ['id', 'user', 'book', 'added_at']
        read_only_fields = ['id', 'user', 'added_at']  # <-- add 'user' here
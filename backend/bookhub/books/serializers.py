from rest_framework import serializers
from .models import Book
from .models import CartItem
from .models import WishlistItem
from .models import BookRating



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

class BookRatingSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()  # Shows username (or __str__ on your User model)
    class Meta:
        model = BookRating
        fields = ['id', 'user', 'book', 'rating', 'comment', 'rated_at']
        read_only_fields = ['id', 'user', 'book', 'rated_at']

class BookSerializer(serializers.ModelSerializer):
    reviews = BookRatingSerializer(source='ratings', many=True, read_only=True)
    class Meta:
        model = Book
        fields = "__all__"
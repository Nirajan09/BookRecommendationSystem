from rest_framework import serializers
from .models import Book, CartItem, WishlistItem, BookRating
import datetime, re

class BookMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'cover_image', 'year_of_publication']  # Added year_of_publication here


class BookRatingSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    book = BookMiniSerializer(read_only=True)

    class Meta:
        model = BookRating
        fields = ['id', 'user', 'book', 'rating', 'comment', 'rated_at']
        read_only_fields = ['id', 'user', 'book', 'rated_at']

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = "__all__"

    def validate_title(self, value):
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Title must be at least 2 characters.")
        if len(value) > 200:
            raise serializers.ValidationError("Title must be under 200 characters.")
        return value

    def validate_author(self, value):
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Author must be at least 2 characters.")
        if len(value) > 100:
            raise serializers.ValidationError("Author must be under 100 characters.")
        if not re.match(r"^[a-zA-Z\s.'-]+$", value):
            raise serializers.ValidationError("Author name contains invalid characters.")
        return value

    def validate_isbn(self, value):
        if not re.match(r"^\d{13}$", value):
            raise serializers.ValidationError("ISBN must be exactly 13 digits.")
        return value

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Price cannot be negative.")
        if round(value, 2) != value:
            raise serializers.ValidationError("Price must have at most 2 decimal places.")
        return value

    def validate_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError("Quantity cannot be negative.")
        return value

    def validate_year_of_publication(self, value):
        current_year = datetime.date.today().year
        if value < 1900:
            raise serializers.ValidationError("Year must be after 1900.")
        if value > current_year:
            raise serializers.ValidationError(f"Year cannot be after {current_year}.")
        return value

class CartItemSerializer(serializers.ModelSerializer):
    book = serializers.PrimaryKeyRelatedField(queryset=Book.objects.all(), write_only=True)
    book_detail = BookSerializer(source='book', read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'user', 'book', 'book_detail', 'quantity', 'added_at']
        read_only_fields = ['id', 'user', 'added_at', 'book_detail']

class WishlistItemSerializer(serializers.ModelSerializer):
    book_detail = BookSerializer(source='book', read_only=True)

    class Meta:
        model = WishlistItem
        fields = ['id', 'user', 'book', 'added_at', 'book_detail']
        read_only_fields = ['id', 'user', 'added_at']

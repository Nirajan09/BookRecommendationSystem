from rest_framework import serializers
from .models import Book, CartItem, WishlistItem, BookRating

class BookMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'cover_image']

class BookRatingSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    book = BookMiniSerializer(read_only=True)

    class Meta:
        model = BookRating
        fields = ['id', 'user', 'book', 'rating', 'comment', 'rated_at']
        read_only_fields = ['id', 'user', 'book', 'rated_at']

class BookSerializer(serializers.ModelSerializer):
    cover_image = serializers.SerializerMethodField()
    price = serializers.FloatField()
    reviews = BookRatingSerializer(source='ratings', many=True, read_only=True)

    class Meta:
        model = Book
        # Removed description and genres
        exclude = ['created_at']  # you can adjust as needed

    def get_cover_image(self, obj):
        value = obj.cover_image
        if not value:
            return None
        if str(value).startswith("http://") or str(value).startswith("https://"):
            return str(value)
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(value.url if hasattr(value, 'url') else value)
        from django.conf import settings
        return f"{settings.MEDIA_URL}{value}"

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

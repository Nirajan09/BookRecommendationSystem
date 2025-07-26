from rest_framework import serializers
from .models import Book
from .models import CartItem
from .models import WishlistItem
from .models import BookRating
from .models import Genre

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['id', 'name']

class BookRatingSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()  # Shows username (or __str__ on your User model)
    class Meta:
        model = BookRating
        fields = ['id', 'user', 'book', 'rating', 'comment', 'rated_at']
        read_only_fields = ['id', 'user', 'book', 'rated_at']

class BookSerializer(serializers.ModelSerializer):
    price = serializers.FloatField()
    reviews = BookRatingSerializer(source='ratings', many=True, read_only=True)
    genres = serializers.ListField(child=serializers.CharField(), write_only=True)
    genres_detail = GenreSerializer(source='genres', many=True, read_only=True)
    class Meta:
        model = Book
        fields = "__all__"
    def create(self, validated_data):
        genre_names = validated_data.pop('genres', [])
        book = super().create(validated_data)
        genres = []
        for name in genre_names:
            genre, _ = Genre.objects.get_or_create(name=name)
            genres.append(genre)
        book.genres.set(genres)
        return book

    def update(self, instance, validated_data):
        genre_names = validated_data.pop('genres', None)
        book = super().update(instance, validated_data)
        if genre_names is not None:
            genres = []
            for name in genre_names:
                genre, _ = Genre.objects.get_or_create(name=name)
                genres.append(genre)
            book.genres.set(genres)
        return book

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

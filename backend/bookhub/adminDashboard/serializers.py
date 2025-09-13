from rest_framework import serializers
from books.models import Book
from orders.models import OrderItem
from django.db.models import Sum 


class BestSellingBookSerializer(serializers.ModelSerializer):
    sold = serializers.SerializerMethodField()
    cover_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = [
            "id",
            'isbn',
            'title',
            'author',
            'year_of_publication',
            'price',
            'cover_image_url',
            'sold',
        ]

    def get_sold(self, obj):
        sold_qty = OrderItem.objects.filter(book=obj).aggregate(total_sold=Sum('quantity'))['total_sold']
        return sold_qty or 0

    def get_cover_image_url(self, obj):
        if obj.cover_image:
            return obj.cover_image.url
        elif obj.dataset_image_url:
            return obj.dataset_image_url
        return None
    
from rest_framework import serializers
from books.models import Book

class LowStockBookSerializer(serializers.ModelSerializer):
    cover_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = [
            'id',
            'isbn',
            'title',
            'author',
            'year_of_publication',
            'price',
            'cover_image_url',
            'quantity', 
        ]

    def get_cover_image_url(self, obj):
        if obj.cover_image:
            return obj.cover_image.url
        elif obj.dataset_image_url:
            return obj.dataset_image_url
        return None

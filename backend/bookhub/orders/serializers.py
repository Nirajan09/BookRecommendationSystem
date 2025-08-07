from rest_framework import serializers
from .models import Order, OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)
    # You can add more book details here if needed

    class Meta:
        model = OrderItem
        fields = ['id', 'book', 'book_title', 'quantity', 'price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user = serializers.StringRelatedField(read_only=True)  # Displays username

    class Meta:
        model = Order
        fields = ['id', 'user', 'address', 'phone', 'status', 'total', 'created', 'updated', 'items']
        read_only_fields = ['status', 'created', 'updated', 'user']  # user & status updated in backend

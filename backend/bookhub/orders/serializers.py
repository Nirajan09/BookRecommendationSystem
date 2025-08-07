# orders/serializers.py
from rest_framework import serializers
from .models import Order, OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'book', 'book_title', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'address', 'phone', 'email', 'shipping_method', 'payment_method', 'shipping_cost', 'status', 'total', 'created', 'updated', 'items']
        read_only_fields = ['status', 'created', 'updated', 'user']

    def create(self, validated_data):
        user = self.context['request'].user
        # Remove 'user' from validated_data if present to avoid duplication
        validated_data.pop('user', None)

        items_data = validated_data.pop('items')

        order = Order.objects.create(user=user, **validated_data)

        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)

        return order



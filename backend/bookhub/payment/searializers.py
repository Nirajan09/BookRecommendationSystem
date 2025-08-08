# payment/serializers.py
from rest_framework import serializers
from .models import Order

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['id', 'user', 'total_amount', 'payment_status', 'payment_method', 'esewa_transaction_id', 'created_at']
        read_only_fields = ['payment_status', 'esewa_transaction_id', 'created_at']

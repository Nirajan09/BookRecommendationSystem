from rest_framework import serializers
from .models import Order, OrderItem
import re


PROVINCES = ["Province 1", "Province 2", "Bagmati", "Gandaki", "Lumbini", "Karnali", "Sudurpashchim"]

CITIES_BY_PROVINCE = {
    "Province 1": ["Biratnagar", "Dharan", "Birgunj"],
    "Province 2": ["Janakpur", "Birgunj", "Bardibas"],
    "Bagmati": ["Kathmandu", "Lalitpur", "Bhaktapur"],
    "Gandaki": ["Pokhara", "Baglung", "Gorkha"],
    "Lumbini": ["Butwal", "Tansen", "Bhairahawa"],
    "Karnali": ["Surkhet", "Jumla", "Dolpa"],
    "Sudurpashchim": ["Dhangadhi", "Mahendranagar", "Dadeldhura"]
}


class OrderItemSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_cover = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'book', 'book_title', 'book_cover', 'price', 'quantity']

    def get_book_cover(self, obj):
        request = self.context.get('request')
        if obj.book.cover_image:
            url = obj.book.cover_image.url
            if request is not None:
                return request.build_absolute_uri(url)
            return url
        return None


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    user = serializers.StringRelatedField(read_only=True)
    reference = serializers.CharField(read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'reference', 'user', 'full_name', 'street', 'ward', 'province', 'city', 'postal_code',
            'email', 'phone', 'shipping_method', 'payment_method', 'shipping_cost',
            'status', 'payment_status', 'total', 'created', 'updated', 'items'
        ]
        read_only_fields = ['created', 'updated', 'user', 'reference']

    def validate(self, data):
        # Full Name
        if not data.get('full_name') or len(data['full_name']) < 2:
            raise serializers.ValidationError({"full_name": "Full Name must be at least 2 characters."})

        # Street
        if not data.get('street') or len(data['street']) < 5:
            raise serializers.ValidationError({"street": "Street address must be at least 5 characters."})

        # Province/City validation
        province = data.get('province')
        city = data.get('city')
        if province not in PROVINCES:
            raise serializers.ValidationError({"province": "Invalid province selected."})
        if city not in CITIES_BY_PROVINCE.get(province, []):
            raise serializers.ValidationError({"city": "Invalid city for the selected province."})

        # Email
        if not data.get('email'):
            raise serializers.ValidationError({"email": "Email is required."})

        # Phone (Nepal format)
        phone = data.get('phone')
        nepal_mobile_regex = re.compile(r'^(98|97)\d{8}$')
        if not phone or not nepal_mobile_regex.match(phone):
            raise serializers.ValidationError(
                {"phone": "Phone must be a valid Nepal mobile number (starts with 97 or 98 and 10 digits)."}
            )

        # Shipping & Payment
        if data.get('shipping_method') not in dict(Order.SHIPPING_CHOICES):
            raise serializers.ValidationError({"shipping_method": "Invalid shipping method."})
        if data.get('payment_method') not in dict(Order.PAYMENT_CHOICES):
            raise serializers.ValidationError({"payment_method": "Invalid payment method."})

        return data

    def create(self, validated_data):
        user = self.context['request'].user
        items_data = validated_data.pop('items')

        # Remove 'user' from validated_data if it accidentally exists to avoid conflict
        validated_data.pop('user', None)

        order = Order.objects.create(user=user, **validated_data)
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        return order

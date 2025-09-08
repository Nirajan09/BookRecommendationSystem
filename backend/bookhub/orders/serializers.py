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
    dataset_image_url = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'book', 'book_title', 'book_cover', 'dataset_image_url', 'price', 'quantity']

    def get_book_cover(self, obj):
        request = self.context.get('request')
        if obj.book.cover_image:
            url = obj.book.cover_image.url
            if request is not None:
                return request.build_absolute_uri(url)
            return url
        return None

    def get_dataset_image_url(self, obj):
        request = self.context.get('request')
        if hasattr(obj.book, 'dataset_image_url') and obj.book.dataset_image_url:
            url = obj.book.dataset_image_url
            if request is not None and not url.startswith('http'):
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
        if self.partial:
            # Only validate fields if present in data (patch update)
            if 'full_name' in data and len(data['full_name']) < 2:
                raise serializers.ValidationError({"full_name": "Full Name must be at least 2 characters."})

            if 'street' in data and len(data['street']) < 5:
                raise serializers.ValidationError({"street": "Street address must be at least 5 characters."})

            province = data.get('province')
            city = data.get('city')
            if province and province not in PROVINCES:
                raise serializers.ValidationError({"province": "Invalid province selected."})
            if city and city not in CITIES_BY_PROVINCE.get(province, []):
                raise serializers.ValidationError({"city": "Invalid city for the selected province."})

            if 'email' in data and not data.get('email'):
                raise serializers.ValidationError({"email": "Email is required."})

            phone = data.get('phone')
            if phone is not None:
                nepal_mobile_regex = re.compile(r'^(98|97)\d{8}$')
                if not nepal_mobile_regex.match(phone):
                    raise serializers.ValidationError(
                        {"phone": "Phone must be a valid Nepal mobile number (starts with 97 or 98 and 10 digits)."}
                    )

            if 'shipping_method' in data and data.get('shipping_method') not in dict(Order.SHIPPING_CHOICES):
                raise serializers.ValidationError({"shipping_method": "Invalid shipping method."})

            if 'payment_method' in data and data.get('payment_method') not in dict(Order.PAYMENT_CHOICES):
                raise serializers.ValidationError({"payment_method": "Invalid payment method."})

        else:
            # Full validation for non-partial operations (e.g., POST, PUT)
            if not data.get('full_name') or len(data['full_name']) < 2:
                raise serializers.ValidationError({"full_name": "Full Name must be at least 2 characters."})
            if not data.get('street') or len(data['street']) < 5:
                raise serializers.ValidationError({"street": "Street address must be at least 5 characters."})

            province = data.get('province')
            city = data.get('city')
            if province not in PROVINCES:
                raise serializers.ValidationError({"province": "Invalid province selected."})
            if city not in CITIES_BY_PROVINCE.get(province, []):
                raise serializers.ValidationError({"city": "Invalid city for the selected province."})

            if not data.get('email'):
                raise serializers.ValidationError({"email": "Email is required."})

            phone = data.get('phone')
            nepal_mobile_regex = re.compile(r'^(98|97)\d{8}$')
            if not phone or not nepal_mobile_regex.match(phone):
                raise serializers.ValidationError({
                    "phone": "Phone must be a valid Nepal mobile number (starts with 97 or 98 and 10 digits)."
                })

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

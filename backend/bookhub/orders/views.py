from rest_framework import viewsets, permissions
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderItemSerializer
from books.models import CartItem
from django.db import transaction
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.conf import settings
class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()  # Add this line
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(user=user)

    @transaction.atomic  # ensure atomicity
    def perform_create(self, serializer):
        # Save order
        order = serializer.save(user=self.request.user)

        # Deduct quantity from books
        for item in order.items.all():
            book = item.book
            if book.quantity is not None:
                # Ensure no negative stock
                book.quantity = max(book.quantity - item.quantity, 0)
                book.save()

        # Optionally, clear cart items corresponding to ordered books
        ordered_book_ids = order.items.values_list('book__id', flat=True)
        CartItem.objects.filter(user=self.request.user, book__id__in=ordered_book_ids).delete()

        @action(detail=True, methods=['GET'])
        def initiate_esewa_payment(self, request, pk=None):
            order = self.get_object()
            if order.payment_status == 'Completed':
                return Response({'detail': 'Order already paid.'}, status=400)

            # Prepare data required by eSewa
            data = {
                'amt': str(order.total_amount),  # Make sure your Order has total_amount field
                'pid': str(order.id),  # product or order ID to track payment
                'scd': settings.ESEWA_MERCHANT_ID,
                'su': request.build_absolute_uri('/api/orders/esewa/success/'),  # success callback URL
                'fu': request.build_absolute_uri('/api/orders/esewa/fail/'),     # failure callback URL
            }
            return Response(data)

class OrderItemViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return OrderItem.objects.all()
        # OrderItems belonging to orders of the user only
        return OrderItem.objects.filter(order__user=user)

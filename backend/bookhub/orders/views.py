from rest_framework import viewsets, permissions, serializers, status
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderItemSerializer
from books.models import CartItem
from django.db import transaction
from rest_framework.decorators import action
from rest_framework.response import Response
from django.conf import settings


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer                     # MUST have this to avoid AssertionError
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Only return orders belonging to the logged-in user unless staff."""
        user = self.request.user
        if user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(user=user)

    @transaction.atomic
    def perform_create(self, serializer):
        """
        Only create the order immediately for Cash on Delivery.
        For Stripe & eSewa, client should call this endpoint ONLY
        after payment is verified successful.
        """
        payment_method = self.request.data.get("payment_method")
        payment_status = self.request.data.get("payment_status", "").lower()

        if payment_method == "cash_on_delivery":
            # Create order immediately for COD
            order = serializer.save(user=self.request.user, payment_status="pending")

            # Deduct stock and clear cart immediately
            for item in order.items.all():
                book = item.book
                if book.quantity is not None:
                    book.quantity = max(book.quantity - item.quantity, 0)
                    book.save()

            CartItem.objects.filter(user=self.request.user,
                                    book__in=[i.book for i in order.items.all()]
                                    ).delete()

        elif payment_method in ["stripe", "esewa"]:
            # Only allow if payment has been confirmed on frontend or backend
            if payment_status != "completed":
                raise serializers.ValidationError({
                    "detail": "Payment for Stripe/eSewa must be completed before creating order."
                })

            order = serializer.save(user=self.request.user, payment_status="completed")

            # Deduct stock & clear cart now that payment is confirmed
            for item in order.items.all():
                book = item.book
                if book.quantity is not None:
                    book.quantity = max(book.quantity - item.quantity, 0)
                    book.save()

            CartItem.objects.filter(user=self.request.user,
                                    book__in=[i.book for i in order.items.all()]
                                    ).delete()
        else:
            raise serializers.ValidationError({"detail": "Invalid payment method."})

    @action(detail=True, methods=['GET'])
    def initiate_esewa_payment(self, request, pk=None):
        order = self.get_object()
        if order.payment_status == 'completed':
            return Response({'detail': 'Order already paid.'}, status=status.HTTP_400_BAD_REQUEST)

        data = {
            'amt': str(order.total),
            'txAmt': "0",  # tax
            'psc': "0",    # service charge
            'pdc': "0",    # delivery charge
            'tAmt': str(order.total),
            'pid': str(order.id),
            'scd': settings.ESEWA_MERCHANT_ID,
            'su': request.build_absolute_uri('/esewa-success/'),
            'fu': request.build_absolute_uri('/esewa-fail/'),
        }
        return Response(data)


class OrderItemViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return OrderItem.objects.all()
        return OrderItem.objects.filter(order__user=user)

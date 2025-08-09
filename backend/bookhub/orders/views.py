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
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(user=user)

    @transaction.atomic
    def perform_create(self, serializer):
        # Save order
        order = serializer.save(user=self.request.user)

        # Deduct quantity from books
        for item in order.items.all():
            book = item.book
            if book.quantity is not None:
                book.quantity = max(book.quantity - item.quantity, 0)
                book.save()

        # Clear cart items corresponding to ordered books
        ordered_book_ids = order.items.values_list('book__id', flat=True)
        CartItem.objects.filter(user=self.request.user, book__id__in=ordered_book_ids).delete()

    @action(detail=True, methods=['GET'])
    def initiate_esewa_payment(self, request, pk=None):
        order = self.get_object()
        if order.payment_status == 'Completed':
            return Response({'detail': 'Order already paid.'}, status=400)

        data = {
            'amt': str(order.total),             # product amount (without tax)
            'txAmt': "0",                       # set tax amount, 0 if none
            'psc': "0",                        # service charge, 0 if none
            'pdc': "0",                        # delivery charge, 0 if none
            'tAmt': str(order.total),          # total amount = amt + txAmt + psc + pdc
            'pid': str(order.id),
            'scd': settings.ESEWA_MERCHANT_ID,  # single merchant ID string
            'su': request.build_absolute_uri('/payment-success/'),
            'fu': request.build_absolute_uri('/payment-fail/'),
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

from rest_framework import viewsets, permissions
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderItemSerializer
from books.models import CartItem
from django.db import transaction
class OrderViewSet(viewsets.ModelViewSet):
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

class OrderItemViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return OrderItem.objects.all()
        # OrderItems belonging to orders of the user only
        return OrderItem.objects.filter(order__user=user)

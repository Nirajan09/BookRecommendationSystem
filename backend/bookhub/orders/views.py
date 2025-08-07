from rest_framework import viewsets, permissions
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderItemSerializer
from books.models import CartItem

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(user=user)

    def perform_create(self, serializer):
        # Save the order and assign user
        order = serializer.save(user=self.request.user)

        # Collect all book IDs from the order items
        ordered_book_ids = order.items.values_list('book__id', flat=True)

        # Delete cart items that belong to the user and match the ordered books
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

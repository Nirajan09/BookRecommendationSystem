from rest_framework import viewsets, generics, filters, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from django.db.models import Avg
from .models import Book, BookRating, CartItem, WishlistItem
from .serializers import BookSerializer, BookRatingSerializer, CartItemSerializer, WishlistItemSerializer
from rest_framework.pagination import LimitOffsetPagination
from rest_framework import status


class AdminBookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return Book.objects.filter(source='admin').order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(source='admin')

    @action(detail=True, methods=['patch'], url_path='update-stock')
    def update_stock(self, request, pk=None):
        book = self.get_object()
        quantity = request.data.get('quantity')

        # Validation
        if quantity is None:
            return Response({"error": "Quantity is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            quantity = int(quantity)
        except ValueError:
            return Response({"error": "Quantity must be an integer."}, status=status.HTTP_400_BAD_REQUEST)
        if quantity < 0:
            return Response({"error": "Quantity cannot be negative."}, status=status.HTTP_400_BAD_REQUEST)

        # Update stock
        book.quantity = quantity
        book.save(update_fields=['quantity'])

        return Response({"message": "Stock updated successfully."}, status=status.HTTP_200_OK)

class BookRatingViewSet(viewsets.ModelViewSet):
    queryset = BookRating.objects.all()
    serializer_class = BookRatingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_destroy(self, instance):
        book = instance.book
        instance.delete()
        avg = book.ratings.aggregate(avg=Avg('rating'))['avg'] or 0
        book.average_rating = round(avg, 2)
        book.save(update_fields=['average_rating'])

class BookListPagination(LimitOffsetPagination):
    default_limit = 8
    max_limit = 20


class BookListView(generics.ListAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "author", "isbn"]
    ordering_fields = ['created_at', 'title']
    pagination_class = BookListPagination

class DatasetBooksPagination(LimitOffsetPagination):
    default_limit = 8
    max_limit = 20  # maximum to prevent overload


class AdminBooksPagination(LimitOffsetPagination):
    default_limit = 8
    max_limit = 20


class DatasetBooksDataViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for dataset books.
    Initial load 8 books, load more 4 books on demand (pagination).
    Shuffles books randomly on each request.
    """
    serializer_class = BookSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = DatasetBooksPagination

    def get_queryset(self):
        return Book.objects.filter(source='dataset').order_by('?')


class AdminBooksDataViewSet(viewsets.ModelViewSet):
    """
    API endpoint for admin-added books.
    Initial 8 books, support paginated loading as user reaches end.
    Shuffles books randomly on each request.
    """
    serializer_class = BookSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = AdminBooksPagination

    def get_queryset(self):
        return Book.objects.filter(source='admin').order_by('?')

class CartItemViewSet(viewsets.ModelViewSet):
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CartItem.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        user = request.user
        book_id = request.data.get('book')
        try:
            quantity = int(request.data.get('quantity', 1))
        except (TypeError, ValueError):
            return Response({'detail': 'Quantity must be an integer.'}, status=status.HTTP_400_BAD_REQUEST)
        if quantity < 1:
            return Response({'detail': 'Quantity must be at least 1.'}, status=status.HTTP_400_BAD_REQUEST)
        if not book_id:
            return Response({"detail": "Book ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            book = Book.objects.get(pk=book_id)
        except Book.DoesNotExist:
            return Response({"detail": "Book not found."}, status=status.HTTP_404_NOT_FOUND)

        existing_item = CartItem.objects.filter(user=user, book=book).first()
        current_qty = existing_item.quantity if existing_item else 0
        new_qty = current_qty + quantity

        if new_qty > book.quantity:
            msg = f"Only {book.quantity - current_qty} item(s) left in stock."
            raise ValidationError({"quantity": msg})

        if existing_item:
            existing_item.quantity = new_qty
            existing_item.save()
            serializer = self.get_serializer(existing_item)
            return Response(serializer.data, status=status.HTTP_200_OK)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class WishlistItemViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WishlistItem.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        user = self.request.user
        book = serializer.validated_data.get('book')
        if WishlistItem.objects.filter(user=user, book=book).exists():
            raise ValidationError({'detail': 'This book is already in your wishlist.'})
        serializer.save(user=user)


class BookViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        if self.request.user.is_staff:
            serializer.save(source='admin')
        else:
            serializer.save(source='dataset')

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def rate(self, request, pk=None):
        book = self.get_object()
        data = {
            "rating": request.data.get("rating"),
            "comment": request.data.get("comment", ""),
        }

        serializer = BookRatingSerializer(data=data)
        serializer.is_valid(raise_exception=True)

        rating_value = serializer.validated_data["rating"]
        comment = serializer.validated_data.get("comment", "")

        rating_obj, created = BookRating.objects.update_or_create(
            user=request.user,
            book=book,
            defaults={"rating": rating_value, "comment": comment},
        )

        # Recalculate average rating
        avg = book.ratings.aggregate(avg=Avg("rating"))["avg"] or 0
        book.average_rating = round(avg, 2)
        book.save(update_fields=["average_rating"])

        return Response({"detail": "Review submitted!"}, status=status.HTTP_201_CREATED)



class UserBookRatingViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = BookRatingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return BookRating.objects.filter(user=self.request.user)

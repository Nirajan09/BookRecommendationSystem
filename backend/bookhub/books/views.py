from rest_framework import viewsets, generics, filters, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from django.db.models import Avg
from .models import Book, BookRating, CartItem, WishlistItem
from .serializers import BookSerializer, BookRatingSerializer, CartItemSerializer, WishlistItemSerializer


class AdminBookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [permissions.IsAdminUser]


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


class BookListView(generics.ListAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "author", "isbn"]  # Removed 'genres__name'
    ordering_fields = ['created_at', 'title']
    permission_classes = [permissions.IsAuthenticated]


class NewReleasesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        books = Book.objects.order_by('-created_at')[:12]
        return Response(BookSerializer(books, many=True).data)


class BestSellersView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        books = Book.objects.order_by('-sold_count')[:12] if hasattr(Book, 'sold_count') else Book.objects.all()[:12]
        return Response(BookSerializer(books, many=True).data)


class TopRatedView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        books = Book.objects.order_by('-average_rating')[:12] if hasattr(Book, 'average_rating') else Book.objects.all()[:12]
        return Response(BookSerializer(books, many=True).data)


class PersonalizedPicksView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        books = Book.objects.all().order_by('?')[:12]
        return Response(BookSerializer(books, many=True).data)


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
        serializer.save(user=self.request.user)


class BookViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def rate(self, request, pk=None):
        book = self.get_object()
        rating_value = request.data.get('rating')
        comment = request.data.get('comment', "")
        try:
            rating_value = int(rating_value)
        except (TypeError, ValueError):
            return Response({'detail': 'Invalid rating.'}, status=status.HTTP_400_BAD_REQUEST)
        if not (1 <= rating_value <= 5):
            return Response({'detail': 'Rating must be 1-5.'}, status=status.HTTP_400_BAD_REQUEST)

        rating_obj, created = BookRating.objects.update_or_create(
            user=request.user, book=book,
            defaults={'rating': rating_value, 'comment': comment}
        )
        avg = book.ratings.aggregate(avg=Avg('rating'))['avg']
        book.average_rating = round(avg if avg is not None else 0, 2)
        book.save(update_fields=['average_rating'])

        return Response({'detail': 'Review submitted!'}, status=status.HTTP_201_CREATED)


class UserBookRatingViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = BookRatingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return BookRating.objects.filter(user=self.request.user)

from rest_framework import viewsets, generics, filters, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Book
from .serializers import BookSerializer

# -------- ADMIN BOOK MANAGEMENT -------
class AdminBookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [permissions.IsAdminUser]

# -------- PUBLIC CURATED SHELVES -------

# General book list with search/order for user explore
class BookListView(generics.ListAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'author']  # Remove 'genre' if not in model
    ordering_fields = ['created_at', 'title']  # Add fields you have in Book model
    permission_classes = [permissions.IsAuthenticated]

# New Releases
class NewReleasesView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        books = Book.objects.order_by('-created_at')[:12]
        return Response(BookSerializer(books, many=True).data)

# Best Sellers (if you have a 'sold_count' field)
class BestSellersView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        books = Book.objects.order_by('-sold_count')[:12] if hasattr(Book, 'sold_count') else Book.objects.all()[:12]
        return Response(BookSerializer(books, many=True).data)

# Top Rated (if you have 'average_rating')
class TopRatedView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        books = Book.objects.order_by('-average_rating')[:12] if hasattr(Book, 'average_rating') else Book.objects.all()[:12]
        return Response(BookSerializer(books, many=True).data)

# Personalized (customize this logic as you wish)
class PersonalizedPicksView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        # For demo: just return 12 random books or most recent
        books = Book.objects.all().order_by('?')[:12]
        return Response(BookSerializer(books, many=True).data)

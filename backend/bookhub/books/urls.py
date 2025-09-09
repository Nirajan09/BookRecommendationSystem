from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AdminBookViewSet,
    BookListView,
    CartItemViewSet,
    WishlistItemViewSet,
    BookViewSet,
    BookRatingViewSet,
    UserBookRatingViewSet,
    AdminBooksDataViewSet,
    DatasetBooksDataViewSet
)

router = DefaultRouter()
router.register(r'admin/books', AdminBookViewSet, basename='admin-books')
router.register('cart', CartItemViewSet, basename='cart')
router.register('wishlist', WishlistItemViewSet, basename='wishlist')
router.register(r'reviews', BookRatingViewSet, basename='reviews')  # Add 
router.register(r'user-reviews', UserBookRatingViewSet, basename='user-reviews')
router.register(r'admin-booksdata', AdminBooksDataViewSet, basename='admin-booksData')
router.register(r'dataset-booksdata', DatasetBooksDataViewSet, basename='dataset-booksData')
router.register(r'', BookViewSet, basename='books')  # NOTE: move this last!


urlpatterns = [
    path('all/', BookListView.as_view(), name='book-list'),
    path('', include(router.urls)),
]

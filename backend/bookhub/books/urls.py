from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AdminBookViewSet,
    BookListView,
    NewReleasesView,
    BestSellersView,
    TopRatedView,
    PersonalizedPicksView,
    CartItemViewSet,
    WishlistItemViewSet,
    BookViewSet,
    BookRatingViewSet,
    UserBookRatingViewSet
)

router = DefaultRouter()
router.register(r'admin/books', AdminBookViewSet, basename='admin-books')
router.register('cart', CartItemViewSet, basename='cart')
router.register('wishlist', WishlistItemViewSet, basename='wishlist')
router.register(r'reviews', BookRatingViewSet, basename='reviews')  # Add 
router.register(r'user-reviews', UserBookRatingViewSet, basename='user-reviews')
router.register(r'', BookViewSet, basename='books')  # NOTE: move this last!


urlpatterns = [
    path('all/', BookListView.as_view(), name='book-list'),
    path('new-releases/', NewReleasesView.as_view(), name='book-new-releases'),
    path('best-sellers/', BestSellersView.as_view(), name='book-best-sellers'),
    path('top-rated/', TopRatedView.as_view(), name='book-top-rated'),
    path('personalized/', PersonalizedPicksView.as_view(), name='book-personalized'),
    path('', include(router.urls)),
    
]

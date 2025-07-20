from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AdminBookViewSet,
    BookListView,
    NewReleasesView,
    BestSellersView,
    TopRatedView,
    PersonalizedPicksView,
)

router = DefaultRouter()
router.register(r'admin/books', AdminBookViewSet, basename='admin-books')

urlpatterns = [
    # Public/explore endpoints
    path('all/', BookListView.as_view(), name='book-list'),
    path('new-releases/', NewReleasesView.as_view(), name='book-new-releases'),
    path('best-sellers/', BestSellersView.as_view(), name='book-best-sellers'),
    path('top-rated/', TopRatedView.as_view(), name='book-top-rated'),
    path('personalized/', PersonalizedPicksView.as_view(), name='book-personalized'),

    # Admin endpoints (CRUD, protected, /books/admin/books/)
    path('', include(router.urls)),
]

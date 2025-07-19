from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminBookViewSet

router = DefaultRouter()
router.register(r'admin/books', AdminBookViewSet, basename='admin-books')

urlpatterns = [
    path('', include(router.urls)),
]

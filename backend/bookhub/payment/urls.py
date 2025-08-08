# payment/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EsewaPaymentVerificationView
from orders.views import OrderViewSet


router = DefaultRouter()
router.register(r'orders', OrderViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('orders/esewa/verify/', EsewaPaymentVerificationView.as_view(), name='esewa-payment-verify'),
]

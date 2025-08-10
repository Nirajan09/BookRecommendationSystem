from django.urls import path
from .views import CreateStripePaymentIntentView

urlpatterns = [
    path('create-stripe-payment-intent/', CreateStripePaymentIntentView.as_view(), name='create-stripe-payment-intent'),
]

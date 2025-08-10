import stripe
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from rest_framework import status

stripe.api_key = settings.STRIPE_SECRET_KEY

class CreateStripePaymentIntentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Get the amount from the frontend request (make sure it's validated)
            amount = request.data.get("amount")
            if amount is None:
                return Response({"detail": "Amount is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Amount must be in cents (smallest currency unit)
            amount_cents = int(float(amount) * 100)

            # Create a PaymentIntent on Stripe
            intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency='usd',  # Use your currency code here
                metadata={
                    "user_id": str(request.user.id),
                },
                # Optionally, you can add receipt_email=request.user.email for receipts
            )

            return Response({
                "clientSecret": intent["client_secret"]
            })

        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

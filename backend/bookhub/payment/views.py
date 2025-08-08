from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.conf import settings
from django.shortcuts import get_object_or_404
import requests
import logging
from .models import Order

logger = logging.getLogger(__name__)

class EsewaPaymentVerificationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        amt = request.data.get('amt')
        pid = request.data.get('pid')
        refId = request.data.get('refId')  # You might or might not use refId for status check API

        if not all([amt, pid]):
            return Response({'detail': 'Missing payment data'}, status=400)

        verify_url = getattr(settings, 'ESEWA_VERIFY_URL', 'https://rc.esewa.com.np/api/epay/transaction/status/')

        # Prepare GET query parameters as per eSewa status check API docs
        # Note: Use your registered product_code / merchant ID here
        params = {
            'product_code': 'EPAYTEST',           # Replace with your actual product code if different
            'transaction_uuid': pid,
            'total_amount': amt,
        }

        try:
            response = requests.get(verify_url, params=params)
            response.raise_for_status()
        except requests.RequestException as e:
            logger.error(f"Request to eSewa failed: {str(e)}")
            return Response({'detail': 'Error communicating with eSewa'}, status=500)

        # Parse JSON response from eSewa
        try:
            result = response.json()
        except ValueError:
            logger.error(f"Invalid JSON response from eSewa: {response.text}")
            return Response({'detail': 'Invalid response from eSewa'}, status=500)

        # Check eSewa payment status from response
        status = result.get('status')
        if status == 'COMPLETE':
            order = get_object_or_404(Order, id=pid)
            if order.payment_status != 'Completed':
                order.payment_status = 'Completed'
                order.esewa_transaction_id = refId  # optionally store the refId if applicable
                order.save()
            return Response({'detail': 'Payment verified successfully'})
        else:
            # You can handle other statuses or return a failure
            return Response({'detail': f'Payment not completed. Status: {status}'}, status=400)

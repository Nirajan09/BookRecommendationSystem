from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Sum
from books.models import Book
from orders.models import Order, OrderItem
from adminDashboard.serializers import BestSellingBookSerializer  # Replace your_app with actual app name
from django.db.models import Q
from adminDashboard.serializers import LowStockBookSerializer
@api_view(['GET'])
@permission_classes([IsAdminUser])
def dashboard_stats(request):
    today = timezone.localdate()
    month_start = today.replace(day=1)

    completed_statuses = ['delivered', 'completed']

    total_sales_today = Order.objects.filter(
        created__date=today,
        status__in=completed_statuses
    ).aggregate(Sum('total'))['total__sum'] or 0

    total_sales_month = Order.objects.filter(
        created__date__gte=month_start,
        status__in=completed_statuses
    ).aggregate(Sum('total'))['total__sum'] or 0

    total_orders = Order.objects.count()

    total_revenue = Order.objects.filter(
        payment_status='completed',
        status__in=completed_statuses
    ).aggregate(Sum('total'))['total__sum'] or 0

    orders_completed_count = Order.objects.filter(status__in=completed_statuses).count()
    orders_left_count = Order.objects.filter(status__in=['pending', 'processing', 'shipped']).count()
    orders_cancelled_count = Order.objects.filter(status='cancelled').count()

    average_order_value = (total_revenue / orders_completed_count) if orders_completed_count > 0 else 0

    best_selling_qs = Book.objects.annotate(
    sold=Sum('orderitem__quantity')
).filter(~Q(sold=None), sold__gt=0).order_by('-sold')[:10]

    best_selling_books_serialized = BestSellingBookSerializer(best_selling_qs, many=True).data

    low_stock_qs = Book.objects.filter(quantity__lt=10)
    low_stock_qs = Book.objects.filter(quantity__lt=10)
    low_stock_alerts_serialized = LowStockBookSerializer(low_stock_qs, many=True).data

    return Response({
        "totalSalesToday": total_sales_today,
        "totalSalesMonth": total_sales_month,
        "numberOfOrders": total_orders,
        "totalRevenue": total_revenue,
        "ordersCompleted": orders_completed_count,
        "ordersLeft": orders_left_count,
        "ordersCancelled": orders_cancelled_count,
        "averageOrderValue": average_order_value,
        "bestSellingBooks": best_selling_books_serialized,
          "lowStockAlerts": low_stock_alerts_serialized,
    })

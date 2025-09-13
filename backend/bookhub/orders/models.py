from django.db import models
from django.conf import settings
from books.models import Book
import uuid

class Order(models.Model):
    SHIPPING_CHOICES = [
        ('standard', 'Standard Delivery'),
        ('express', 'Express Delivery'),
        ('pickup', 'Store Pickup'),
    ]
    PAYMENT_CHOICES = [
        ('esewa', 'E-Sewa'),
        ('cash_on_delivery', 'Cash on Delivery'),
        ('stripe', 'Stripe'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    
    # New fields
    full_name = models.CharField(max_length=100)
    street = models.CharField(max_length=255)
    ward = models.CharField(max_length=50, blank=True, null=True)
    province = models.CharField(max_length=50)
    city = models.CharField(max_length=50)
    postal_code = models.CharField(max_length=10, blank=True, null=True)
    email = models.EmailField()
    phone = models.CharField(max_length=10)

    shipping_method = models.CharField(max_length=20, choices=SHIPPING_CHOICES, default='standard')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default='cash_on_delivery')
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    
    payment_status = models.CharField(max_length=20, choices=[('pending','Pending'),('completed','Completed'),('failed','Failed')], default='pending')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    reference = models.CharField(max_length=24, unique=True, editable=False, blank=True, null=True)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.reference:
            self.reference = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order #{self.pk} by {self.user.username} - Status: {self.status}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    book = models.ForeignKey(Book, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=8, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} x {self.book.title} (Order #{self.order.pk})"

    class Meta:
        verbose_name = "Order Item"
        verbose_name_plural = "Order Items"

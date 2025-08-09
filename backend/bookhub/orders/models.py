from django.db import models
from django.conf import settings
from books.models import Book  # Assuming a Book model exists in the books app
import uuid

class Order(models.Model):
    SHIPPING_CHOICES = [
        ('standard', 'Standard Delivery'),
        ('express', 'Express Delivery'),
        ('pickup', 'Store Pickup'),
    ]
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    PAYMENT_CHOICES = [
        ('esewa', 'E-Sewa'),
        ('cash_on_delivery', 'Cash on Delivery'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    address = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    email = models.EmailField(null=True, blank=True)  # new field
    shipping_method = models.CharField(max_length=20, choices=SHIPPING_CHOICES, default='standard')  # new field
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default='cash_on_delivery')  # new field
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)  # new field
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='pending'
    )
    # Keep your status choice for shipping separately:
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    # Add the reference field here:
    reference = models.CharField(max_length=24, unique=True, editable=False, blank=True, null=True)

    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total = models.DecimalField(decimal_places=2, max_digits=10)

    def __str__(self):
        return f"Order #{self.pk} by {self.user.username} - Status: {self.status}"

    class Meta:
        ordering = ['-created']

    def save(self, *args, **kwargs):
        if not self.reference:
            self.reference = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    book = models.ForeignKey(Book, on_delete=models.PROTECT)  # Protect book on delete to keep order history safe
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(decimal_places=2, max_digits=8)  # Price at purchase time

    def __str__(self):
        return f"{self.quantity} x {self.book.title} (Order #{self.order.pk})"

    class Meta:
        verbose_name = "Order Item"
        verbose_name_plural = "Order Items"

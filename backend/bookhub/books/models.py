from django.conf import settings
from django.db import models
from django.core.exceptions import ValidationError
import datetime, re

class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    isbn = models.CharField(max_length=13, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    sold_count = models.PositiveIntegerField(default=0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    cover_image = models.ImageField(upload_to='covers/', null=True, blank=True)
    quantity = models.PositiveIntegerField(default=0)
    year_of_publication = models.PositiveIntegerField(null=True, blank=True)

    def clean(self):
        # Title validation
        if not self.title or len(self.title.strip()) < 2:
            raise ValidationError("Title must be at least 2 characters.")
        if len(self.title) > 200:
            raise ValidationError("Title must be under 200 characters.")

        # Author validation
        if not self.author or len(self.author.strip()) < 2:
            raise ValidationError("Author name must be at least 2 characters.")
        if len(self.author) > 100:
            raise ValidationError("Author name must be under 100 characters.")
        if not re.match(r"^[a-zA-Z\s.'-]+$", self.author):
            raise ValidationError("Author name contains invalid characters.")

        # ISBN validation
        if not re.match(r"^\d{13}$", self.isbn):
            raise ValidationError("ISBN must be exactly 13 digits.")

        # Price validation
        if self.price < 0:
            raise ValidationError("Price cannot be negative.")
        if round(self.price, 2) != self.price:
            raise ValidationError("Price must have at most 2 decimal places.")

        # Quantity validation
        if self.quantity < 0:
            raise ValidationError("Quantity cannot be negative.")

        # Year of publication validation
        current_year = datetime.date.today().year
        if self.year_of_publication:
            if self.year_of_publication < 1900:
                raise ValidationError("Year must be after 1900.")
            if self.year_of_publication > current_year:
                raise ValidationError(f"Year cannot be after {current_year}.")

class BookRating(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="book_ratings")
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="ratings")
    comment = models.TextField(blank=True, null=True)
    rating = models.PositiveSmallIntegerField()
    rated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'book')

    def __str__(self):
        return f"{self.user} - {self.book.title}: {self.rating}"

class CartItem(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cart_items')
    book = models.ForeignKey('Book', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'book')

class WishlistItem(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlist_items')
    book = models.ForeignKey('Book', on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'book')

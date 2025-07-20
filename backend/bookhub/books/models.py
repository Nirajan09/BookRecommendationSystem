from django.conf import settings
from django.db import models

class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    isbn = models.CharField(max_length=13, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    sold_count = models.PositiveIntegerField(default=0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    cover_image = models.ImageField(upload_to='covers/', null=True, blank=True)

    def __str__(self):
        return self.title

class BookRating(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="book_ratings"
    )
    book = models.ForeignKey(
        Book,
        on_delete=models.CASCADE,
        related_name="ratings"
    )
    # REQUIRED field, but only present if user has rated!
    comment = models.TextField(blank=True, null=True)  # <-- Add this line here
    rating = models.PositiveSmallIntegerField()  # e.g. 1-5 stars
    rated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'book')  # One rating per user-book pair

    def __str__(self):
        return f"{self.user} - {self.book.title}: {self.rating}"

# This structure means: if a user hasn't rated a book, there is NO BookRating row.

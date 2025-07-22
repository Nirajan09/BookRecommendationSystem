from django.contrib import admin
from .models import Book

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'isbn', 'price', 'quantity')  # show quantity in listing
    fields = ('title', 'author', 'isbn', 'description', 'price', 'quantity', 'cover_image')
    # or use 'fieldsets' to group fields, if desired

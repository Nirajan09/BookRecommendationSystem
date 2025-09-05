# admin.py
from django.contrib import admin
from .models import Book

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('id','title', 'author', 'isbn', 'price', 'quantity')
    fields = ('title', 'author', 'isbn', 'description', 'price', 'quantity', 'cover_image')

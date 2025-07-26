from django.contrib import admin
from .models import Book
from .models import Genre

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('id','title', 'author', 'isbn', 'price', 'quantity')  # show quantity in listing
    fields = ('title', 'author', 'isbn', 'genres', 'description', 'price', 'quantity', 'cover_image')
    filter_horizontal = ('genres',)
    # or use 'fieldsets' to group fields, if desired

@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')

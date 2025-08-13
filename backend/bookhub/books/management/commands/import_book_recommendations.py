# books/management/commands/import_book_recommendations.py
import os
import pickle
from django.core.management.base import BaseCommand
from django.conf import settings
from books.models import Book, BookRecommendation

class Command(BaseCommand):
    help = "Import KNN recommendations from pickle file into BookRecommendation model"

    def handle(self, *args, **kwargs):
        pickle_path = os.path.abspath(os.path.join(settings.BASE_DIR, '..', 'data', 'book_knn_recommendations.pkl'))

        try:
            with open(pickle_path, 'rb') as f:
                recommendations_dict = pickle.load(f)
        except FileNotFoundError:
            self.stderr.write(f"Pickle file not found at {pickle_path}")
            return

        count = 0
        for book_key, rec_keys in recommendations_dict.items():
            try:
                book = Book.objects.get(isbn=book_key)  # ISBN lookup
            except Book.DoesNotExist:
                self.stderr.write(f"Book not found: {book_key}")
                continue

            rec_obj, created = BookRecommendation.objects.get_or_create(book=book)
            rec_books = Book.objects.filter(isbn__in=rec_keys)  # ISBN lookup for recommendations
            rec_obj.recommended_books.set(rec_books)
            count += 1

        self.stdout.write(self.style.SUCCESS(f"Imported recommendations for {count} books."))

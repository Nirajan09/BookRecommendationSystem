# books/management/commands/import_clean_books.py
from django.core.management.base import BaseCommand
import pandas as pd
from books.models import Book
import os
from django.conf import settings
class Command(BaseCommand):
    help = "Import cleaned books from CSV into Book model"

    def handle(self, *args, **kwargs):
        data_dir = os.path.join(settings.BASE_DIR, '..', 'data')
        csv_path = os.path.abspath(os.path.join(data_dir, 'clean_books.csv'))
        df = pd.read_csv(csv_path)

        for _, row in df.iterrows():
            Book.objects.get_or_create(
                isbn=row['ISBN'],
                defaults={
                    'title': row['Book-Title'],
                    'author': row['Book-Author'],
                    'cover_image': row['Image-URL-L'],
                    'price': 9.99, 
                    'quantity': 10 
                }
            )
        self.stdout.write(self.style.SUCCESS("Books imported successfully!"))

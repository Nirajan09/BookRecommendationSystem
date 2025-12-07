import os
import pandas as pd
import random
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.conf import settings
from books.models import Book

class Command(BaseCommand):
    help = "Load books from clean_books.csv starting after last Book ID"

    def handle(self, *args, **kwargs):
        file_path = os.path.join(settings.BASE_DIR, "books", "data", "clean_books.csv")
        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f"File not found at {file_path}"))
            return

        df = pd.read_csv(file_path)
        imported, skipped = 0, 0

        # Get the last Book ID
        last_book = Book.objects.order_by("-id").first()
        next_id = last_book.id + 1 if last_book else 1

        # Optional: skip rows already imported by checking ISBNs
        existing_isbns = set(Book.objects.values_list("isbn", flat=True))

        for _, row in df.iterrows():
            try:
                isbn = str(row.get("ISBN", "")).zfill(13)
                if len(isbn) != 13 or not isbn.isdigit():
                    skipped += 1
                    continue

                # Skip if ISBN already exists
                if isbn in existing_isbns:
                    continue

                title = str(row.get("Book-Title", "")).strip()
                author = str(row.get("Book-Author", "Unknown")).strip() or "Unknown"

                year = row.get("Year-Of-Publication", None)
                try:
                    year = int(year) if pd.notna(year) and str(year).isdigit() else None
                except:
                    year = None

                # Random price between 500 and 1600 NPR
                price = Decimal(random.randint(500, 1600))

                cover_image_url = row.get("Image-URL-L", None)

                # Create new book
                Book.objects.create(
                    id=next_id,
                    isbn=isbn,
                    title=title,
                    author=author,
                    year_of_publication=year,
                    price=price,
                    quantity=100,
                    dataset_image_url=cover_image_url if pd.notna(cover_image_url) else None,
                )

                imported += 1
                next_id += 1  # increment ID for the next book

            except Exception as e:
                skipped += 1
                self.stdout.write(self.style.WARNING(f"Skipped row due to error: {e}"))

        self.stdout.write(self.style.SUCCESS(f"Imported {imported} books, skipped {skipped} rows."))

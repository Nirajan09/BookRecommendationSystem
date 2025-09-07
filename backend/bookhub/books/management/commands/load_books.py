import os
import pandas as pd
import random
import requests
from io import BytesIO
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.core.files import File
from django.conf import settings
from books.models import Book

class Command(BaseCommand):
    help = "Load books from clean_books.csv with original column names, random prices, and images"

    def handle(self, *args, **kwargs):
        file_path = os.path.join(settings.BASE_DIR, "books", "data", "clean_books.csv")
        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f"File not found at {file_path}"))
            return

        df = pd.read_csv(file_path)
        imported, skipped = 0, 0

        for _, row in df.iterrows():
            try:
                isbn = str(row.get("ISBN", "")).zfill(13)
                if len(isbn) != 13 or not isbn.isdigit():
                    skipped += 1
                    continue

                title = str(row.get("Book-Title", "")).strip()
                author = str(row.get("Book-Author", "Unknown")).strip() or "Unknown"

                year = row.get("Year-Of-Publication", None)
                try:
                    year = int(year) if pd.notna(year) and str(year).isdigit() else None
                except:
                    year = None

                # Random price between 500 and 1600 NPR
                price_npr = random.randint(500, 1600)
                price = Decimal(price_npr)

                cover_image_url = row.get("Image-URL-L", None)

                obj, created = Book.objects.update_or_create(
                    isbn=isbn,
                    defaults={
                        "title": title,
                        "author": author,
                        "year_of_publication": year,
                        "price": price,
                        "quantity": 100,
                        "dataset_image_url": cover_image_url if pd.notna(cover_image_url) else None,
                    },
                )

                if created:
                    imported += 1

            except Exception as e:
                skipped += 1
                self.stdout.write(self.style.WARNING(f"Skipped row due to error: {e}"))

        self.stdout.write(self.style.SUCCESS(f"Imported {imported} books, skipped {skipped} rows."))

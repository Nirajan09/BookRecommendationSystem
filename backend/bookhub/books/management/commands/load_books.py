import os
import pandas as pd
from django.core.management.base import BaseCommand
from books.models import Book
from decimal import Decimal
from django.conf import settings

class Command(BaseCommand):
    help = "Load books from clean_books.csv into the database"

    def handle(self, *args, **kwargs):
        file_path = os.path.join(settings.BASE_DIR, "books", "data", "clean_books.csv")
        df = pd.read_csv(file_path)

        for _, row in df.iterrows():
            Book.objects.get_or_create(
                isbn=row["ISBN"],
                defaults={
                    "title": row["title"],
                    "author": row["author"],
                    "year_of_publication": int(row["year_of_publication"]) if str(row["year_of_publication"]).isdigit() else None,
                    "price": Decimal("0.00"),
                    "quantity": 10,
                }
            )

        self.stdout.write(self.style.SUCCESS("Books imported successfully!"))

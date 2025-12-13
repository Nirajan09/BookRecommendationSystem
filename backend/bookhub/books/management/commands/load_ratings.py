import pandas as pd
import json
import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db.models import Avg
from books.models import Book, BookRating

User = get_user_model()

MAPPING_FILE = "books/data/user_mapping.json"


class Command(BaseCommand):
    help = "Load ratings from CSV and update average ratings for books"

    def handle(self, *args, **kwargs):
        ratings_df = pd.read_csv("books/data/ratings_normalized.csv")

        # ---- Load existing mapping if available ----
        if os.path.exists(MAPPING_FILE):
            with open(MAPPING_FILE, "r") as f:
                user_mapping = json.load(f)
        else:
            user_mapping = {}

        # ---- Iterate over CSV and insert ratings ----
        for _, row in ratings_df.iterrows():
            csv_user_id = str(int(row["User-ID"]))  # keep as str for JSON keys
            isbn = str(row["ISBN"]).zfill(13)
            rating_value = int(row["Book-Rating"])

            # Ensure user exists (map CSV user → Django user.id)
            if csv_user_id not in user_mapping:
                user, _ = User.objects.get_or_create(
                    username=f"User_{csv_user_id}",
                    defaults={
                        "email": f"User_{csv_user_id}@gmail.com",
                        "password": "pbkdf2_sha256$recommender",
                    },
                )
                user_mapping[csv_user_id] = user.id
            else:
                user = User.objects.get(id=user_mapping[csv_user_id])

            # Ensure book exists
            try:
                book = Book.objects.get(isbn=isbn)
            except Book.DoesNotExist:
                self.stdout.write(self.style.WARNING(f"Book {isbn} not found, skipping..."))
                continue

            # Insert or update rating
            BookRating.objects.update_or_create(
                user=user,
                book=book,
                defaults={"rating": rating_value},
            )

        self.stdout.write(self.style.SUCCESS("✅ Ratings loaded successfully."))

        # ---- Save mapping back to file ----
        with open(MAPPING_FILE, "w") as f:
            json.dump(user_mapping, f, indent=2)

        self.stdout.write(self.style.SUCCESS(f"✅ User mapping saved to {MAPPING_FILE}"))

        self.stdout.write(self.style.SUCCESS("✅ Book average ratings updated successfully."))

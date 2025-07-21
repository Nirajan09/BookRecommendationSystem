import React from "react";
import BookCard from "./BookCard";

export default function BookShelf({ title, books }) {
  const safeBooks = Array.isArray(books) ? books : [];
  if (safeBooks.length === 0) return null;
  return (
    <div className="mb-8">
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <div className="grid gap-6 grid-cols-2 md:grid-cols-4 xl:grid-cols-6">
        {safeBooks.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}

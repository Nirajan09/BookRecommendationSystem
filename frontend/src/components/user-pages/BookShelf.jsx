import React, { useRef, useState, useEffect } from "react";
import BookCard from "./BookCard";
import { ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/solid";

export default function BookShelf({ title, books }) {
  const safeBooks = Array.isArray(books) ? books : [];
  const scrollRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  useEffect(() => {
    // Only show right arrow if there are more than 4 books
    setShowRight(safeBooks.length > 4);
    setShowLeft(false);
  }, [safeBooks.length]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeft(scrollLeft > 0);
    setShowRight(scrollLeft + clientWidth < scrollWidth - 1 && safeBooks.length > 4);
  };

  useEffect(() => {
    const scRef = scrollRef.current;
    if (scRef) {
      scRef.addEventListener("scroll", handleScroll);
    }
    window.addEventListener("resize", handleScroll);
    return () => {
      if (scRef) {
        scRef.removeEventListener("scroll", handleScroll);
      }
      window.removeEventListener("resize", handleScroll);
    };
    // eslint-disable-next-line
  }, [safeBooks.length]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      // Approximate card width (update as needed)
      const cardWidth = scrollRef.current.firstChild?.offsetWidth || 270;
      const scrollAmount = cardWidth * 2; // scroll 2 cards at a time for better UX
      scrollRef.current.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (safeBooks.length === 0) return null;

  return (
    <section className="relative mb-8">
      <h2 className="text-3xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">{title}</h2>
      {/* Left Arrow */}
      {showLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2"
          aria-label="Scroll left"
        >
          <ChevronLeftIcon className="h-6 w-6 text-gray-700" />
        </button>
      )}
      {/* Book Row - show max 4 at a time */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto hide-scrollbar space-x-6 pb-2"
        style={{ scrollBehavior: "smooth" }}
      >
        {safeBooks.map((book) => (
          <div
            key={book.id}
            className="flex-shrink-0 w-[270px] md:w-[270px] lg:w-[270px]"
            style={{ minWidth: 270, maxWidth: 270 }} // Fixed width per card
          >
            <BookCard book={book} />
          </div>
        ))}
      </div>
      {/* Right Arrow */}
      {showRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2"
          aria-label="Scroll right"
        >
          <ChevronRightIcon className="h-6 w-6 text-gray-700" />
        </button>
      )}
      <style>
        {`/* Hide scrollbar for Chrome, Safari and Opera */
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none;  scrollbar-width: none; }
        `}
      </style>
    </section>
  );
}

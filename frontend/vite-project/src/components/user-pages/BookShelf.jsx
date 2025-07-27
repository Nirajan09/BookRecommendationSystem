
import React, { useRef, useState, useEffect } from "react";
import BookCard from "./BookCard";
import { ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/solid";

export default function BookShelf({ title, books }) {
  const safeBooks = Array.isArray(books) ? books : [];
  const scrollRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);
  useEffect(() => {
    const checkScroll = () => {
      if (!scrollRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 0);
      setShowRight(scrollLeft + clientWidth < scrollWidth - 1);
    };
    checkScroll();
    scrollRef.current?.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      scrollRef.current?.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [safeBooks.length]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 320; // Should match your card width + margin
      scrollRef.current.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (safeBooks.length === 0) return null;

  return (
    <div className="mb-8 relative">
      <h2 className="font-semibold text-3xl mb-2 mt-6 ">{title}</h2>
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
      {/* Book Row */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto hide-scrollbar space-x-6 py-2 pl-10 pb-8"
        style={{ scrollBehavior: "smooth" }}
      >
        {safeBooks.map((book) => (
          <div key={book.id} className="flex-shrink-0 w-70 mr-0">
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
              .hide-scrollbar::-webkit-scrollbar {
                display: none;
              }
              /* Hide scrollbar for IE, Edge and Firefox */
              .hide-scrollbar {
                -ms-overflow-style: none;  /* IE and Edge */
                scrollbar-width: none;     /* Firefox */
              }
              `}
      </style>
    </div>
  );
}
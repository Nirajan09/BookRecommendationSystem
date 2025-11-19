import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import book1 from "../../assets/top 1 book.png";
import book2 from "../../assets/book 2 image 2.png";
import book3 from "../../assets/book3 img 3.png";

export default function HeroSection() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState({
    book1: false,
    book2: false,
    book3: false,
  });

  const handleStart = () => {
    if (!token) return;
    setLoading(true);
    setTimeout(() => setLoading(false), 1200);
  };

  useEffect(() => {
    // Lazy load images
    const loadImage = (src, key) => {
      const img = new Image();
      img.src = src;
      img.onload = () => setImagesLoaded(prev => ({ ...prev, [key]: true }));
    };
    loadImage(book1, "book1");
    loadImage(book2, "book2");
    loadImage(book3, "book3");
  }, []);

  return (
    <section className="relative w-full min-h-[80vh] flex items-center justify-center overflow-hidden bg-white px-4 sm:px-6 md:px-20">
      {/* Invisible overlay for possible effects */}
      <div className="absolute inset-0 pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto w-full flex flex-col items-center py-5 gap-8 lg:hidden">
        {/* Text Above Images on small screens */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
          Welcome to BookStore
        </h1>
        <p className="text-gray-600 text-base sm:text-lg leading-relaxed text-center max-w-lg">
          Discover your next favorite book.
          <br />
          Register or log in to get personalized recommendations!
        </p>
        {/* Images placed between text and button on mobile */}
        <div className="w-full flex flex-row gap-4 justify-center">
          <div className="flex flex-col gap-4">
            {/* Big Book */}
            {imagesLoaded.book1 ? (
              <img
                src={book1}
                alt="Book 1"
                className="w-32 h-44 rounded-2xl shadow-xl border-4 border-blue-100 object-cover mx-auto"
              />
            ) : (
              <div className="w-32 h-44 bg-gray-300 animate-pulse rounded-2xl border-4 border-blue-100 mx-auto" />
            )}
          </div>
          <div className="flex flex-col gap-4">
            {/* Stacked Books */}
            {imagesLoaded.book2 ? (
              <img
                src={book2}
                alt="Book 2"
                className="w-16 h-20 rounded-2xl shadow-lg border-2 border-indigo-200 object-cover mx-auto"
              />
            ) : (
              <div className="w-16 h-20 bg-gray-300 animate-pulse rounded-2xl border-2 border-indigo-200 mx-auto" />
            )}
            {imagesLoaded.book3 ? (
              <img
                src={book3}
                alt="Book 3"
                className="w-16 h-20 rounded-2xl shadow-lg border-2 border-indigo-200 object-cover mx-auto"
              />
            ) : (
              <div className="w-16 h-20 bg-gray-300 animate-pulse rounded-2xl border-2 border-indigo-200 mx-auto" />
            )}
          </div>
        </div>
        {/* Button at the bottom */}
        <Link
          to={token ? "/books" : "/login"}
          onClick={handleStart}
          className="inline-block mt-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-lg shadow-md hover:opacity-90 hover:-translate-y-0.5 focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all duration-300"
        >
          {loading ? "Loading..." : "Get Started"}
        </Link>
      </div>

      {/* Desktop layout (md and above) */}
      <div className="relative z-10 hidden lg:flex md:flex-row w-full h-full items-center justify-between gap-16 px-6 py-10">
        {/* Text Section */}
        <div className="flex-1 flex flex-col items-start">
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
            Welcome to BookStore
          </h1>
          <p className="text-gray-600 text-lg mb-6 leading-relaxed max-w-md">
            Discover your next favorite book.
            <br />
            Register or log in to get personalized recommendations!
          </p>
          <Link
            to={token ? "/books" : "/login"}
            onClick={handleStart}
            className="inline-block mt-6 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-lg shadow-md hover:opacity-90 hover:-translate-y-0.5 focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all duration-300"
          >
            {loading ? "Loading..." : "Get Started"}
          </Link>
        </div>
        {/* Books images desktop */}
        <div className="flex flex-row items-end justify-center gap-8 flex-1 min-w-[300px]">
          {/* Big Book */}
          {imagesLoaded.book1 ? (
            <img
              src={book1}
              alt="Book 1"
              className="w-56 lg:w-80 h-auto rounded-2xl shadow-2xl border-4 border-blue-100 object-cover"
            />
          ) : (
            <div className="w-56 lg:w-80 h-96 md:h-[26rem] bg-gray-300 animate-pulse rounded-2xl border-4 border-blue-100" />
          )}
          {/* Stacked Books */}
          <div className="flex flex-col gap-6 ml-[-24px]">
            {imagesLoaded.book2 ? (
              <img
                src={book2}
                alt="Book 2"
                className="w-36 lg:w-40  h-auto rounded-2xl shadow-lg border-2 border-indigo-200 object-cover"
              />
            ) : (
              <div className="w-36 lg:w-40 h-64 bg-gray-300 animate-pulse rounded-2xl border-2 border-indigo-200" />
            )}
            {imagesLoaded.book3 ? (
              <img
                src={book3}
                alt="Book 3"
                className="w-36 lg:w-40  h-auto rounded-2xl shadow-lg border-2 border-indigo-200 object-cover"
              />
            ) : (
              <div className="w-36 lg:w-05 h-64 bg-gray-300 animate-pulse rounded-2xl border-2 border-indigo-200" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

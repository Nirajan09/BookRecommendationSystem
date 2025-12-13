import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import BookCard from "./BookCard";
import BookShelf from "./BookShelf";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function AdminBookCarousel() {
  const { token } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 8;
  const [hasMore, setHasMore] = useState(true);
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 4; // number visible at once for switching

  const fetchBooks = async (offsetParam) => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/books/admin-booksdata/`, {
        params: { limit, offset: offsetParam },
        headers: { Authorization: `Token ${token}` },
      });
      setBooks(prev => [...prev, ...res.data.results]);
      setHasMore(res.data.length === limit);
      setHasMore(res.data.next !== null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks(0);
    setOffset(limit);
  }, []);

  
  return (
      <BookShelf title="New Releases" books={books} />
  );
}

function DatasetBookGrid() {
  const { token } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const limitInitial = 8;
  const limitLoadMore = 4;
  const [hasMore, setHasMore] = useState(true);

  const fetchBooks = async (offsetParam, limitParam) => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/books/dataset-booksdata/`, {
        params: { limit: limitParam, offset: offsetParam },
        headers: { Authorization: `Token ${token}` },
      });
      if (offsetParam === 0) {
        setBooks(res.data.results);
      } else {
        setBooks((prev) => [...prev, ...res.data.results]);
      }
      setHasMore(res.data.next !== null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks(0, limitInitial);
    setOffset(limitInitial);
  }, []);

  const loadMore = () => {
    if (loading || !hasMore) return;
    fetchBooks(offset, limitLoadMore);
    setOffset((prev) => prev + limitLoadMore);
  };

   if (books.length === 0 && !loading) return null;

  return (
    <>
      {books.length > 0 && (
        <section className="px-2">
          <h2 className="text-3xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
            Explore Books
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loading}
              className="cursor-pointer mt-8 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-md disabled:opacity-60"
            >
              {loading ? "Loading..." : "Load More"}
            </button>
          )}
        </section>
      )}
      {loading && books.length === 0 && (
        <div className="flex justify-center items-center py-20">
          <span className="text-lg text-blue-500 font-semibold">Loading books...</span>
        </div>
      )}
    </>
  );
}

export default function CombinedBooksPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AdminBookCarousel />
      <DatasetBookGrid />
    </div>
  );
}

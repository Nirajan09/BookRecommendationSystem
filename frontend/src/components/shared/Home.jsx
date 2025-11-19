import { Link } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext/AuthContext';
import { useState } from 'react';

export default function Home() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  // Optional: Simulate loading for demonstration
  const handleStart = (e) => {
    if (!token) return;
    setLoading(true);
    setTimeout(() => setLoading(false), 1200);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-white flex items-center justify-center text-2xl font-bold text-blue-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white flex items-center justify-center">
      <main
        className="flex flex-row items-center justify-center gap-14 px-14 py-14 w-full bg-gradient-to-tr max-sm:flex-col max-sm:gap-8 max-sm:text-center"
      >
        <div className="flex-1 flex flex-col items-start justify-center max-sm:items-center">
          <h1 className="text-3xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
            Welcome to BookStore
          </h1>
          <p className="text-gray-600 text-lg max-sm:text-base mb-8 leading-relaxed max-w-xl">
            Discover your next favorite book.<br />
            Register or log in to get personalized recommendations!
          </p>
          <div className="mt-2">
            <Link
              to={token ? "/books" : "/login"}
              onClick={handleStart}
              className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-10 py-3 rounded-xl font-semibold text-lg shadow-lg hover:-translate-y-1 hover:scale-105 focus:ring-2 focus:ring-indigo-600 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center h-120 max-sm:h-64">
          <img
            src="/homeImage.jpg"
            alt="Books and reading"
            className="h-full w-auto max-h-full rounded-2xl shadow-2xl object-cover bg-gradient-to-br from-blue-100 to-purple-100"
          />
        </div>
      </main>
    </div>
  );
}

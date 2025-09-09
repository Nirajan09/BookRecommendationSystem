import { Link } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext/AuthContext';

export default function Home() {
  const { token } = useAuth();
  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-gradient-to-tr from-blue-50 via-cyan-50 to-white items-center justify-center">
      <main className="flex flex-row items-center justify-center gap-12 md:gap-8 px-4 py-8 w-full max-w-6xl mx-auto md:flex-col md:text-center">
        {/* Text Section */}
        <div className="flex-1 flex flex-col items-start md:items-center justify-center">
          <h1 className="text-4xl font-bold text-blue-700 mb-4 md:text-3xl sm:text-2xl">
            Welcome to BookStore
          </h1>
          <p className="text-gray-700 text-lg md:text-base mb-8 leading-relaxed">
            Discover your next favorite book.<br />
            Register or log in to get personalized recommendations!
          </p>
          <div className="mt-2">
            <Link
              to={token ? "/books" : "/login"}
              className="inline-block bg-gradient-to-r from-blue-700 to-cyan-400 hover:from-blue-800 hover:to-cyan-600 text-white px-8 py-3 rounded-lg font-semibold text-base shadow hover:-translate-y-1 hover:scale-105 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
        {/* Image Section */}
        <div className="flex-1 flex items-center justify-center">
          <img
            src="/homeImage.jpg"
            alt="Books and reading"
            className="max-w-xs w-full h-auto rounded-xl shadow-lg md:max-w-[180px]"
          />
        </div>
      </main>
    </div>
  );
}

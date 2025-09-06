import { FiSearch } from "react-icons/fi"; 

export default function BookSearchBar({ value, onChange, onSearch }) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") onSearch();
  };

  return (
    <div className="mb-8 flex justify-center">
      <div className="relative w-full max-w-xl flex justify-between">
        <input
          type="text"
          placeholder="Search books, authors, ISBN..."
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          className="
            w-full pl-5 pr-12 py-2
            bg-white border-2 border-gray-200
            rounded-full shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500
            placeholder-gray-400
            transition
            "
        />
        <button
          type="button"
          onClick={onSearch}
          aria-label="Search"
          className="
            absolute right-0 top-1/2 -translate-y-1/2
            bg-blue-600 hover:bg-blue-700 text-white
            rounded-full p-2 shadow
            transition
            flex items-center justify-center
          "
        >
          <FiSearch size={22} />
        </button>
      </div>
    </div>
  );
}

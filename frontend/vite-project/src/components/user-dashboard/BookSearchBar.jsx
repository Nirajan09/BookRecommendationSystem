import React from "react";

export default function BookSearchBar({ value, onChange, onSearch }) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") onSearch();
  };
  return (
    <div className="mb-8 flex">
      <input
        type="text"
        placeholder="Search books, authors, ISBN..."
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        className="border px-4 py-2 w-full rounded-l"
      />
      <button
        className="bg-blue-600 text-white px-4 rounded-r"
        type="button"
        onClick={onSearch}
      >
        Search
      </button>
    </div>
  );
}

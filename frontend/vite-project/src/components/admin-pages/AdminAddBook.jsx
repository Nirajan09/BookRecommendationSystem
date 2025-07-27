import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminAddBook() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm();

  // State for genre input
  const [genreInput, setGenreInput] = useState("");

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("author", data.author);
      formData.append("isbn", data.isbn);
      formData.append("price", data.price);
      formData.append("description", data.description || "");
      formData.append("quantity", data.quantity);

      // Parse genres: comma separated, trimmed, not empty
      const genreList = genreInput
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean);

      if (genreList.length === 0) {
        toast.error("At least one genre is required!");
        return;
      }

      for (const genre of genreList) {
        formData.append("genres", genre);
      }

      if (data.cover_image?.[0]) {
        formData.append("cover_image", data.cover_image[0]);
      }

      await axios.post("http://localhost:8000/books/admin/books/", formData, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      toast.success("Book added successfully!");
      navigate("/admin/books");
    } catch (err) {
      toast.error("Failed to add book.");
    }
  };

  return (
    <div className="flex flex-col items-center px-2 py-8 bg-gray-100 min-h-screen">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm flex flex-col"
        encType="multipart/form-data"
      >
        <h2 className="text-xl font-bold text-indigo-700 mb-4">Add New Book</h2>

        {/* Genre input */}
        <label className="mb-2 text-sm text-gray-600">Genres (comma-separated):</label>
        <input
          value={genreInput}
          onChange={e => setGenreInput(e.target.value)}
          placeholder="e.g. Fantasy, Romance, Adventure"
          className="w-full px-3 py-2 border rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-blue-50"
          required
        />
        {/* Optionally: Validate */}
        {genreInput.trim() === "" &&
          <span className="text-red-500 text-xs mb-1">
            At least one genre is required
          </span>
        }

        {/* ...rest of your form fields as before... */}
        <input
          {...register("title", { required: true })}
          placeholder="Title"
          className="w-full px-3 py-2 border rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-blue-50"
        />
        {errors.title && (
          <span className="text-red-500 text-xs mb-1">Title is required</span>
        )}

        <input
          {...register("author", { required: true })}
          placeholder="Author"
          className="w-full px-3 py-2 border rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-blue-50"
        />
        {errors.author && (
          <span className="text-red-500 text-xs mb-1">Author is required</span>
        )}

        <input
          {...register("isbn", {
            required: true,
            maxLength: 13
          })}
          placeholder="ISBN"
          maxLength={13}
          className="w-full px-3 py-2 border rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-blue-50"
        />
        {errors.isbn && (
          <span className="text-red-500 text-xs mb-1">
            ISBN is required and must be at most 13 characters
          </span>
        )}

        <input
          {...register("price", {
            required: true,
            pattern: /^\d+(\.\d{1,2})?$/
          })}
          placeholder="Price"
          type="number"
          step="0.01"
          min="0"
          className="w-full px-3 py-2 border rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-blue-50"
        />
        {errors.price && (
          <span className="text-red-500 text-xs mb-1">
            Price is required and must be a valid number with up to 2 decimals
          </span>
        )}

        <input
          {...register("quantity", {
            required: true,
            min: 0,
            valueAsNumber: true
          })}
          placeholder="Quantity"
          type="number"
          min="0"
          className="w-full px-3 py-2 border rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-blue-50"
        />
        {errors.quantity && (
          <span className="text-red-500 text-xs mb-1">
            Quantity is required and must be 0 or more
          </span>
        )}

        <textarea
          {...register("description")}
          placeholder="Description"
          className="w-full px-3 py-2 border rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-blue-50"
          rows={3}
        />

        <label className="mb-2 text-sm text-gray-600">Cover Image:</label>
        <input
          {...register("cover_image", { required: true })}
          type="file"
          accept="image/*"
          className="mb-3"
        />
        {errors.cover_image && (
          <span className="text-red-500 text-xs mb-1">
            Cover image is required
          </span>
        )}

        <button
          disabled={isSubmitting}
          type="submit"
          className="w-full py-2 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold transition"
        >
          {isSubmitting ? "Saving..." : "Add Book"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/admin/books")}
          className="w-full mt-2 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded font-medium transition"
        >
          Back to List
        </button>
      </form>
    </div>
  );
}

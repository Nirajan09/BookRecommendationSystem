import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function AdminEditBook() {
  const { token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm();

  // Fetch current book data on mount
  useEffect(() => {
    axios.get(`http://localhost:8000/books/admin/books/${id}/`, {
      headers: { Authorization: `Token ${token}` }
    })
    .then(res => {
      const book = res.data;
      setValue("title", book.title);
      setValue("author", book.author);
      setValue("isbn", book.isbn);
      setValue("price", book.price);
      setValue("description", book.description);
    })
    .catch(() => navigate("/admin/books"));
  }, [id, setValue, token, navigate]);

  // Submit updated book info (with optional new cover image)
  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("author", data.author);
    formData.append("isbn", data.isbn);
    formData.append("price", data.price);
    formData.append("description", data.description || "");
    if (data.cover_image?.[0]) {
      formData.append("cover_image", data.cover_image[0]);
    }
    try {
      await axios.patch(`http://localhost:8000/books/admin/books/${id}/`, formData, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      toast.success("Book updated successfully!");
      navigate(`/admin/books/${id}`);
    } catch {
      toast.error("Failed to update book.");
    }
  };

  return (
    <div className="flex flex-col items-center px-2 py-8 bg-gray-100 min-h-screen">
      <form
        className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm flex flex-col"
        onSubmit={handleSubmit(onSubmit)}
        encType="multipart/form-data"
      >
        <h2 className="text-xl font-bold text-indigo-700 mb-4">Edit Book</h2>

        <input
          {...register("title", { required: true })}
          placeholder="Title"
          className="w-full px-3 py-2 border rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-blue-50"
        />
        {errors.title && <span className="text-red-500 text-xs mb-1">Title required</span>}

        <input
          {...register("author", { required: true })}
          placeholder="Author"
          className="w-full px-3 py-2 border rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-blue-50"
        />
        {errors.author && <span className="text-red-500 text-xs mb-1">Author required</span>}

        <input
  {...register("isbn", { required: true, maxLength: 13 })}
  placeholder="ISBN"
  maxLength={13}
  className="w-full px-3 py-2 border rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-blue-50"
/>
{errors.isbn && <span className="text-red-500 text-xs mb-1">ISBN must be at most 13 characters</span>}

<input
  {...register("price", {
      required: true,
      pattern: /^\d+(\.\d{1,2})?$/,
      validate: v => (v && v.toString().split(".")[1]?.length <= 2) || "Max 2 decimals"
    })}
  placeholder="Price"
  type="number"
  step="0.01"
  min="0"
  className="w-full px-3 py-2 border rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-blue-50"
/>
{errors.price && <span className="text-red-500 text-xs mb-1">Price must have at most 2 decimal places</span>}

        <textarea
          {...register("description")}
          placeholder="Description"
          className="w-full px-3 py-2 border rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-blue-50"
          rows={3}
        />

        <label className="mb-2 text-sm text-gray-600">Replace Cover Image (optional):</label>
        <input
          {...register("cover_image")}
          type="file"
          accept="image/*"
          className="mb-3"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold transition"
        >
          {isSubmitting ? "Saving..." : "Update Book"}
        </button>
        <button
          type="button"
          onClick={() => navigate(`/admin/books/${id}`)}
          className="w-full mt-2 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded font-medium transition"
        >
          Back to Details
        </button>
      </form>
    </div>
  );
}

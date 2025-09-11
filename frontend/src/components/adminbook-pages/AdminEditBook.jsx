import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminEditBook() {
  const { token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm();

  useEffect(() => {
    axios
      .get(`http://localhost:8000/books/admin/books/${id}/`, { headers: { Authorization: `Token ${token}` } })
      .then((res) => {
        const book = res.data;
        setValue("title", book.title);
        setValue("author", book.author);
        setValue("isbn", book.isbn);
        setValue("price", book.price);
        setValue("quantity", book.quantity);
        setValue("year_of_publication", book.year_of_publication);
      })
      .catch(() => navigate("/admin/books"));
  }, [id, setValue, token, navigate]);

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("author", data.author);
    formData.append("isbn", data.isbn);
    formData.append("price", data.price);
    formData.append("quantity", data.quantity);
    formData.append("year_of_publication", data.year_of_publication);
    if (data.cover_image?.[0]) formData.append("cover_image", data.cover_image[0]);

    try {
      await axios.patch(`http://localhost:8000/books/admin/books/${id}/`, formData, {
        headers: { Authorization: `Token ${token}`, "Content-Type": "multipart/form-data" }
      });
      toast.success("Book updated successfully!");
      navigate(`/admin/books/${id}`);
    } catch {
      toast.error("Failed to update book.");
    }
  };

  return (
    <div className="flex flex-col items-center px-2 py-8 h-[87vh] bg-gradient-to-tr from-blue-50/70 via-white to-purple-50/60">
      <form
        className="bg-white/90 shadow-xl rounded-2xl border border-gray-200 p-8 w-full max-w-sm flex flex-col"
        onSubmit={handleSubmit(onSubmit)}
        encType="multipart/form-data"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit Book</h2>

        {/* Title */}
        <input
          {...register("title", {
            required: "Title is required",
            minLength: { value: 2, message: "Title must be at least 2 characters" },
            maxLength: { value: 200, message: "Title must be under 200 characters" }
          })}
          placeholder="Title"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-blue-50/80 text-gray-800"
        />
        {errors.title && <span className="text-red-600 text-xs mb-1">{errors.title.message}</span>}

        {/* Author */}
        <input
          {...register("author", {
            required: "Author is required",
            minLength: { value: 2, message: "Author must be at least 2 characters" },
            maxLength: { value: 100, message: "Author must be under 100 characters" },
            pattern: { value: /^[a-zA-Z\s.'-]+$/, message: "Author name contains invalid characters" }
          })}
          placeholder="Author"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-blue-50/80 text-gray-800"
        />
        {errors.author && <span className="text-red-600 text-xs mb-1">{errors.author.message}</span>}

        {/* ISBN */}
        <input
          {...register("isbn", {
            required: "ISBN is required",
            pattern: { value: /^\d{13}$/, message: "ISBN must be exactly 13 digits" }
          })}
          placeholder="ISBN"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-blue-50/80 text-gray-800"
        />
        {errors.isbn && <span className="text-red-600 text-xs mb-1">{errors.isbn.message}</span>}

        {/* Price */}
        <input
          {...register("price", {
            required: "Price is required",
            pattern: { value: /^\d+(\.\d{1,2})?$/, message: "Price must be a valid number with up to 2 decimals" },
            min: { value: 0, message: "Price cannot be negative" }
          })}
          placeholder="Price"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-blue-50/80 text-gray-800"
        />
        {errors.price && <span className="text-red-600 text-xs mb-1">{errors.price.message}</span>}

        {/* Quantity */}
        <input
          {...register("quantity", {
            required: "Quantity is required",
            min: { value: 0, message: "Quantity cannot be negative" },
            valueAsNumber: true
          })}
          placeholder="Quantity"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-blue-50/80 text-gray-800"
        />
        {errors.quantity && <span className="text-red-600 text-xs mb-1">{errors.quantity.message}</span>}

        {/* Year of Publication */}
        <input
          {...register("year_of_publication", {
            required: "Year of publication is required",
            min: { value: 1900, message: "Year must be after 1900" },
            max: { value: new Date().getFullYear(), message: `Year cannot be after ${new Date().getFullYear()}` },
            valueAsNumber: true
          })}
          placeholder="Year of Publication"
          type="number"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-blue-50/80 text-gray-800"
        />
        {errors.year_of_publication && <span className="text-red-600 text-xs mb-1">{errors.year_of_publication.message}</span>}

        {/* Cover Image */}
        <label className="mb-2 text-sm text-gray-600">Replace Cover Image (optional):</label>
        <input {...register("cover_image")} type="file" accept="image/*" className="mb-3 text-gray-600" />

        {/* Buttons */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 mt-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded font-semibold shadow-sm transition-all duration-150 hover:brightness-110 disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Update Book"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/admin/books")}
          className="w-full mt-2 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded font-medium transition-all duration-150"
        >
          Back to Books Grid
        </button>
      </form>
    </div>
  );
}

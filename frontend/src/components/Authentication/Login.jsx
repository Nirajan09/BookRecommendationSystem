import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";
import { loginSchema } from "../../utils/ValidationSchema/ValidationSchema";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import { useState } from "react";
const backendUrl = import.meta.env.VITE_BACKEND_URL;
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await axios.post(`${backendUrl}/accounts/login/`, data);
      toast.success("Login successful!", {
        position: "top-right",
        autoClose: 2000,
        closeButton: false,
      });
      const profile = await login(res.data.token);
      navigate(profile && profile.is_staff ? "/admin" : "/books");
    } catch {
      toast.error("Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  if (loading || isSubmitting) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center text-2xl font-bold text-blue-500">
        Loading...
      </div>
    );
  }

  return (
    <section className="min-h-[90vh] flex items-center justify-center px-4 py-8 sm:py-12 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-md bg-white border border-blue-200 rounded-2xl shadow-lg p-8 sm:p-10 flex flex-col items-center animate-fade-in">
        <h2 className="mb-6 text-blue-700 font-bold tracking-wide text-2xl sm:text-3xl text-center">
          Welcome Back
        </h2>

        <form
          className="w-full flex flex-col"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          {/* Username */}
          <input
            {...register("username")}
            placeholder="Username"
            autoComplete="username"
            className="w-full px-4 py-3 mb-2 border border-blue-200 rounded-lg bg-blue-50 text-base focus:border-blue-700 focus:bg-blue-100 transition"
          />
          {errors.username && (
            <p className="text-red-500 text-sm mb-3 animate-fade-in">
              {errors.username.message}
            </p>
          )}

          {/* Password */}
          <input
            {...register("password")}
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            className="w-full px-4 py-3 mb-2 border border-blue-200 rounded-lg bg-blue-50 text-base focus:border-blue-700 focus:bg-blue-100 transition"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mb-3 animate-fade-in">
              {errors.password.message}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:opacity-90 transition transform hover:-translate-y-0.5 focus:ring-2 focus:ring-blue-300"
          >
            Login
          </button>

          {/* Links */}
          <p className="mt-6 text-center text-gray-600 text-sm">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-600 underline hover:text-blue-800"
            >
              Register
            </Link>
          </p>
          <p className="mt-2 text-center">
            <Link
              to="/"
              className="text-gray-400 text-xs hover:text-gray-600 hover:underline"
            >
              Back to Home
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}

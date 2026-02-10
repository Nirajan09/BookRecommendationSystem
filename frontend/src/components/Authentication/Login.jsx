import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";
import { loginSchema } from "../../utils/ValidationSchema/ValidationSchema";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import { useState } from "react";
import Loader from "../../shared/Loader";

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
      const res = await axios.post(
        `${backendUrl}/accounts/login/`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Login successful!", { autoClose: 2000 });

      const profile = await login(res.data.token);
      navigate(profile?.is_staff ? "/admin" : "/books");

    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data;

        Object.values(errData).forEach((messages) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => toast.error(msg));
          } else {
            toast.error(messages);
          }
        });
      } else {
        toast.error("Invalid credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading || isSubmitting) {
    return <Loader />;
  }

  return (
    <section className="min-h-[90vh] flex items-center justify-center px-4 py-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-md bg-white border rounded-2xl shadow-lg p-8">
        <h2 className="mb-6 text-blue-700 font-bold text-2xl text-center">
          Welcome Back
        </h2>

        <form className="w-full flex flex-col" onSubmit={handleSubmit(onSubmit)} noValidate>

          <input
            {...register("username")}
            placeholder="Username"
            className="w-full px-4 py-3 mb-2 border rounded-lg"
          />
          {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}

          <input
            {...register("password")}
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 mb-2 border rounded-lg"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 rounded-xl bg-blue-600 text-white font-semibold"
          >
            Login
          </button>

          <p className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 underline">Register</Link>
          </p>
        </form>
      </div>
    </section>
  );
}

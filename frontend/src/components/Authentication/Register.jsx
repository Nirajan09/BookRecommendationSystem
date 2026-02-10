import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";
import { registerSchema } from "../../utils/ValidationSchema/ValidationSchema";
import { useState } from "react";
import Loader from "../../shared/Loader";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      await axios.post(
        `${backendUrl}/accounts/register/`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Registration successful! Please login.", {
        position: "top-right",
        autoClose: 2000,
      });

      setTimeout(() => navigate("/login"), 2200);

    } catch (error) {
      //DRF error handling
      if (error.response && error.response.data) {
        const errData = error.response.data;

        // Show field-specific errors
        Object.values(errData).forEach((messages) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => toast.error(msg));
          } else {
            toast.error(messages);
          }
        });
      } else {
        toast.error("Registration failed. Please try again.");
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
      <div className="w-full max-w-md bg-white border border-blue-200 rounded-2xl shadow-lg p-8 flex flex-col items-center">
        <h2 className="mb-6 text-blue-700 font-bold text-2xl text-center">
          Create an Account
        </h2>

        <form className="w-full flex flex-col" onSubmit={handleSubmit(onSubmit)} noValidate>

          <input
            {...register("username")}
            placeholder="Username"
            className="w-full px-4 py-3 mb-2 border rounded-lg"
          />
          {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}

          <input
            {...register("email")}
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 mb-2 border rounded-lg"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

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
            Register
          </button>

          <p className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 underline">Login</Link>
          </p>
        </form>
      </div>
    </section>
  );
}

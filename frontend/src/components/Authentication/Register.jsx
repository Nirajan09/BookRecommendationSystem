import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';
import { registerSchema } from '../../utils/ValidationSchema/ValidationSchema';
import { useState } from 'react';

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(registerSchema)
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await axios.post('http://localhost:8000/accounts/register/', data);
      toast.success('Registration successful! Please login.');
      setTimeout(() => {
        navigate('/login');
      }, 2200);
    } catch {
      toast.error('Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 mb-4 p-9 sm:p-6 bg-white rounded-2xl shadow-lg flex flex-col items-center animate-fade-in">
      <h2 className="mb-6 text-blue-700 font-bold tracking-wide text-2xl sm:text-xl">Create an Account</h2>
      <form className="w-full flex flex-col" onSubmit={handleSubmit(onSubmit)} noValidate>
        <input
          {...register('username')}
          placeholder="Username"
          autoComplete="username"
          className="w-full px-4 py-3 mb-2 border border-blue-200 rounded-lg text-base bg-blue-50 focus:border-blue-700 focus:bg-blue-100 transition"
        />
        {errors.username && <div className="text-red-500 w-full text-left mb-3 text-sm animate-fade-in">{errors.username.message}</div>}
        <input
          {...register('email')}
          type="email"
          placeholder="Email"
          autoComplete="email"
          className="w-full px-4 py-3 mb-2 border border-blue-200 rounded-lg text-base bg-blue-50 focus:border-blue-700 focus:bg-blue-100 transition"
        />
        {errors.email && <div className="text-red-500 w-full text-left mb-3 text-sm animate-fade-in">{errors.email.message}</div>}
        <input
          {...register('password')}
          type="password"
          placeholder="Password"
          autoComplete="new-password"
          className="w-full px-4 py-3 mb-2 border border-blue-200 rounded-lg text-base bg-blue-50 focus:border-blue-700 focus:bg-blue-100 transition"
        />
        {errors.password && <div className="text-red-500 w-full text-left mb-3 text-sm animate-fade-in">{errors.password.message}</div>}
        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-blue-700 to-cyan-400 text-white rounded-lg font-semibold text-lg mt-2 shadow hover:from-blue-800 hover:to-cyan-600 transform hover:-translate-y-0.5 hover:scale-105 transition-all"
          disabled={isSubmitting || loading}
        >
          {isSubmitting || loading ? "Registering In..." : "Register"}
        </button>
        <div className="mt-6 text-center text-gray-600 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 underline hover:text-blue-800">Login</Link>
        </div>
        <div className="mt-2 text-center">
          <Link to="/" className="text-gray-400 text-xs hover:underline">Back to Home</Link>
        </div>
      </form>
    </div>
  );
}

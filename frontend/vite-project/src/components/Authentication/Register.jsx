import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import "./Auth.css";
import { registerSchema } from '../../utils/ValidationSchema/ValidationSchema';
import { useState } from 'react';

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting}
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
    }finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <input
          {...register('username')}
          placeholder="Username"
          autoComplete="username"
        />
        {errors.username && <div className="error">{errors.username.message}</div>}
        <input
          {...register('email')}
          type="email"
          placeholder="Email"
          autoComplete="email"
        />
        {errors.email && <div className="error">{errors.email.message}</div>}
        <input
          {...register('password')}
          type="password"
          placeholder="Password"
          autoComplete="new-password"
        />
        {errors.password && <div className="error">{errors.password.message}</div>}
        <button type="submit">{isSubmitting || loading ? "Registering In..." : "Register"}</button>
      </form>
    </div>
  );
}

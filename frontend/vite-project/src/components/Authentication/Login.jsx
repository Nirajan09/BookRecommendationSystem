import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';
import { loginSchema } from '../../utils/ValidationSchema/ValidationSchema';
import { useAuth } from '../../utils/AuthContext/AuthContext';
import { useState } from 'react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/accounts/login/', data);
      toast.success('Login successful!', {
        position: "top-right",
        autoClose: 2000,
        closeButton: false,
      });
      login(res.data.token);

      setTimeout(() => {
        navigate('/dashboard');
      }, 2200);
      
    } catch {
      toast.error('Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Welcome Back</h2>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <input
          {...register('username')}
          placeholder="Username"
          autoComplete="username"
        />
        {errors.username && <div className="error">{errors.username.message}</div>}
        <input
          {...register('password')}
          type="password"
          placeholder="Password"
          autoComplete="current-password"
        />
        {errors.password && <div className="error">{errors.password.message}</div>}
        <button type="submit">{isSubmitting || loading ? "Logging In..." : "Login"}</button>
        <div className="account-info">
          Don't have an account? <Link to="/register" className="register-link">Register</Link>
        </div>
        <div className="back-home">
          <Link to="/" className="home-link">
            Back to Home
          </Link>
        </div>
      </form>
    </div>
  );
}
// src/components/Login.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const [mode, setMode] = useState('login'); // 'login', 'register', 'guest'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login, register, guestLogin } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username.length > 20) {
      newErrors.username = 'Username must be less than 20 characters';
    }

    // Email validation (only for register)
    if (mode === 'register' && formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    // Password validation (not for guest)
    if (mode !== 'guest') {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      // Confirm password (only for register)
      if (mode === 'register') {
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      let result;

      if (mode === 'login') {
        result = await login({
          username: formData.username,
          password: formData.password
        });
      } else if (mode === 'register') {
        result = await register({
          username: formData.username,
          email: formData.email || undefined,
          password: formData.password
        });
      } else if (mode === 'guest') {
        result = await guestLogin(formData.username);
      }

      if (!result.success && result.message) {
        // Handle specific server errors
        if (result.message.includes('username')) {
          setErrors({ username: result.message });
        } else if (result.message.includes('email')) {
          setErrors({ email: result.message });
        } else if (result.message.includes('password')) {
          setErrors({ password: result.message });
        } else {
          setErrors({ general: result.message });
        }
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    resetForm();
  };

  return (
    <div className="login-container">
      <div className="logo">
        <h1>HectoClash</h1>
        <p>Competitive Mathematical Duels</p>
      </div>

      <div className="login-form">
        <div className="form-tabs">
          <button
            type="button"
            className={`tab-button ${mode === 'login' ? 'active' : ''}`}
            onClick={() => switchMode('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={`tab-button ${mode === 'register' ? 'active' : ''}`}
            onClick={() => switchMode('register')}
          >
            Register
          </button>
          <button
            type="button"
            className={`tab-button ${mode === 'guest' ? 'active' : ''}`}
            onClick={() => switchMode('guest')}
          >
            Guest
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {errors.general && (
            <div className="error-message general">{errors.general}</div>
          )}

          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={`form-control ${errors.username ? 'error' : ''}`}
              placeholder="Enter your username"
              disabled={loading}
            />
            {errors.username && (
              <div className="error-message">{errors.username}</div>
            )}
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email (optional)
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`form-control ${errors.email ? 'error' : ''}`}
                placeholder="Enter your email"
                disabled={loading}
              />
              {errors.email && (
                <div className="error-message">{errors.email}</div>
              )}
            </div>
          )}

          {mode !== 'guest' && (
            <>
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`form-control ${errors.password ? 'error' : ''}`}
                  placeholder="Enter your password"
                  disabled={loading}
                />
                {errors.password && (
                  <div className="error-message">{errors.password}</div>
                )}
              </div>

              {mode === 'register' && (
                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                    placeholder="Confirm your password"
                    disabled={loading}
                  />
                  {errors.confirmPassword && (
                    <div className="error-message">{errors.confirmPassword}</div>
                  )}
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            className="btn btn--primary btn--full-width"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-text">
                {mode === 'login' ? 'Logging in...' : 
                 mode === 'register' ? 'Creating account...' : 
                 'Joining as guest...'}
              </span>
            ) : (
              <span>
                {mode === 'login' ? 'Login' : 
                 mode === 'register' ? 'Create Account' : 
                 'Play as Guest'}
              </span>
            )}
          </button>
        </form>

        <div className="login-info">
          <h4>About HectoClash</h4>
          <p>
            Compete in real-time mathematical duels! Given a sequence of six digits, 
            create mathematical expressions using +, -, ×, ÷, ^ and parentheses to equal 100.
          </p>
          <p>
            <strong>Example:</strong> For "123456" → "1 + (2 + 3 + 4) × (5 + 6)" = 100
          </p>
          <div className="feature-list">
            <div className="feature">🎮 Real-time competitive duels</div>
            <div className="feature">🏆 Global leaderboards and rankings</div>
            <div className="feature">📊 Detailed performance analytics</div>
            <div className="feature">🎯 Practice mode with hints</div>
            <div className="feature">👥 Spectator mode for live games</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

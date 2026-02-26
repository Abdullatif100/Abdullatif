import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import '../styles/Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Use the userAPI service for login
      const response = await userAPI.login(formData);
      const data = response.data;
      
      // Pass both user data and tokens to the login function
      login({
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        name: `${data.user.first_name} ${data.user.last_name}`.trim(),
        role: data.role,
      }, data.tokens);

      navigate('/dashboard');
    } catch (err) {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
      let errorMessage = err.response?.data?.error || err.message || 'Login failed. Please try again.';

      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Server imechelewa kujibu. Hakikisha backend ina-run kisha jaribu tena.';
      } else if (!err.response) {
        errorMessage = `Imeshindikana kuifikia server (${apiBaseUrl}). Hakikisha backend ina-run na endpoint ni sahihi.`;
      }

      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

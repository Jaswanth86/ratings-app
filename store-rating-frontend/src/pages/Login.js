import React, { useState } from 'react';
import { login } from '../services/api';
import '../styles/Auth.css';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user' // For UI only, not sent to backend
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Sending login data:', { email: formData.email, password: formData.password });
      const { token, role } = await login({
        email: formData.email,
        password: formData.password
      });
      localStorage.setItem('token', token);
      window.location.href = `/${role}`; // Use backend-provided role
    } catch (err) {
      console.error('Login error:', err);
      setError(err || 'Invalid credentials');
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          required
        />
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="user">User</option>
          <option value="store_owner">Store Owner</option>
        </select>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
import React, { useState } from 'react';
import { signup } from '../services/api';
import '../styles/Auth.css';

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    role: 'user' // Default role
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (formData.name.length < 20 || formData.name.length > 60) return 'Name must be 20-60 characters';
    if (formData.address.length > 400) return 'Address must be less than 400 characters';
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*@])[A-Za-z\d!@#$%^&*@]{8,16}$/;
    if (!passwordRegex.test(formData.password)) {
      return 'Password must be 8-16 characters with at least one uppercase letter and one special character (!@#$%^&*@)';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Invalid email format';
    if (!['user', 'store_owner'].includes(formData.role)) return 'Invalid role selected'; // Restrict to user and store_owner
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    try {
      console.log('Sending signup data:', formData);
      await signup(formData);
      window.location.href = '/login';
    } catch (err) {
      console.error('Signup error:', err);
      setError(err || 'Signup failed');
    }
  };

  return (
    <div className="auth-container">
      <h2>Signup</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" required />
        <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
        <input name="address" value={formData.address} onChange={handleChange} placeholder="Address" required />
        <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Password" required />
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="user">User</option>
          <option value="store_owner">Store Owner</option>
        </select>
        <button type="submit">Signup</button>
      </form>
    </div>
  );
}

export default Signup;
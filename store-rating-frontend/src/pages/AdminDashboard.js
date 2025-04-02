import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardStats from '../components/DashboardStats';
import DataTable from '../components/DataTable';
import Filters from '../components/Filters';
import FormSection from '../components/FormSection';

function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState({});
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', address: '', role: 'user' });
  const [newStore, setNewStore] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    fetchDashboardData();
    fetchUsers();
    fetchStores();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDashboardData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard data');
      checkSession(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/users`, {
        params: filters,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load users');
      checkSession(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/stores`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStores(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load stores');
      checkSession(err);
    } finally {
      setLoading(false);
    }
  };

  const validateUser = () => {
    if (newUser.name.length < 20 || newUser.name.length > 60) return 'Name must be 20-60 characters';
    if (newUser.address.length > 400) return 'Address must be less than 400 characters';
    if (!/^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/.test(newUser.password)) {
      return 'Password must be 8-16 characters with uppercase and special character';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) return 'Invalid email format';
    return null;
  };

  const validateStore = () => {
    if (newStore.name.length < 20 || newStore.name.length > 60) return 'Name must be 20-60 characters';
    if (newStore.address.length > 400) return 'Address must be less than 400 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newStore.email)) return 'Invalid email format';
    if (!newStore.ownerId || isNaN(newStore.ownerId)) return 'Valid owner ID required';
    return null;
  };

  const addUser = async (e) => {
    e.preventDefault();
    const validationError = validateUser();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/user`, newUser, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNewUser({ name: '', email: '', password: '', address: '', role: 'user' });
      fetchUsers();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add user');
      checkSession(err);
    } finally {
      setLoading(false);
    }
  };

  const addStore = async (e) => {
    e.preventDefault();
    const validationError = validateStore();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/store`, newStore, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNewStore({ name: '', email: '', address: '', ownerId: '' });
      fetchStores();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add store');
      checkSession(err);
    } finally {
      setLoading(false);
    }
  };

  const sortData = (key, setData, data) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
    const sorted = [...data].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setData(sorted);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const checkSession = (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (loading) return <div className="loading">Loading...</div>;

  const userHeaders = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address' },
    { key: 'role', label: 'Role' }
  ];

  const storeHeaders = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address' },
    { key: 'rating', label: 'Rating' }
  ];

  const userFields = [
    { name: 'name', placeholder: 'Name' },
    { name: 'email', placeholder: 'Email' },
    { name: 'password', type: 'password', placeholder: 'Password' },
    { name: 'address', placeholder: 'Address' },
    { 
      name: 'role', 
      type: 'select', 
      options: [
        { value: 'user', label: 'User' },
        { value: 'admin', label: 'Admin' },
        { value: 'store_owner', label: 'Store Owner' }
      ]
    }
  ];

  const storeFields = [
    { name: 'name', placeholder: 'Store Name' },
    { name: 'email', placeholder: 'Store Email' },
    { name: 'address', placeholder: 'Store Address' },
    { name: 'ownerId', placeholder: 'Owner ID' }
  ];

  return (
    <div className="dashboard">
      <h2>Admin Dashboard</h2>
      {error && <div className="error">{error}</div>}
      
      <DashboardStats stats={dashboardData} />
      
      <FormSection
        title="Add New User"
        fields={userFields}
        values={newUser}
        onChange={(e) => setNewUser({ ...newUser, [e.target.name]: e.target.value })}
        onSubmit={addUser}
        buttonText="Add User"
      />

      <FormSection
        title="Add New Store"
        fields={storeFields}
        values={newStore}
        onChange={(e) => setNewStore({ ...newStore, [e.target.name]: e.target.value })}
        onSubmit={addStore}
        buttonText="Add Store"
      />

      <Filters filters={filters} onChange={handleFilterChange} onApply={fetchUsers} />

      <h3>Users</h3>
      <DataTable 
        headers={userHeaders} 
        data={users} 
        onSort={(key) => sortData(key, setUsers, users)}
        sortConfig={sortConfig}
      />

      <h3>Stores</h3>
      <DataTable 
        headers={storeHeaders} 
        data={stores.map(s => ({ ...s, rating: s.rating?.toFixed(1) }))} 
        onSort={(key) => sortData(key, setStores, stores)}
        sortConfig={sortConfig}
      />

      <button className="logout-btn" onClick={logout}>Logout</button>
    </div>
  );
}

export default AdminDashboard;
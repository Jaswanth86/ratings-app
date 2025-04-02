import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardStats from '../components/DashboardStats';
import DataTable from '../components/DataTable';
import PasswordUpdate from '../components/PasswordUpdate';

function StoreOwnerDashboard() {
  const [dashboardData, setDashboardData] = useState({ ratings: [], averageRating: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [passwordData, setPasswordData] = useState({ current: '', new: '' });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/store/dashboard`, {
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

  const updatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/store/password`,
        { currentPassword: passwordData.current, newPassword: passwordData.new },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setPasswordData({ current: '', new: '' });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update password');
      checkSession(err);
    } finally {
      setLoading(false);
    }
  };

  const sortData = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
    const sorted = [...dashboardData.ratings].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setDashboardData({ ...dashboardData, ratings: sorted });
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

  const headers = [
    { key: 'name', label: 'User Name' },
    { key: 'rating', label: 'Rating' }
  ];

  const stats = {
    averageRating: dashboardData.averageRating?.toFixed(1),
    totalRatings: dashboardData.ratings.length
  };

  return (
    <div className="dashboard">
      <h2>Store Owner Dashboard</h2>
      {error && <div className="error">{error}</div>}
      
      <PasswordUpdate 
        onSubmit={updatePassword}
        passwordData={passwordData}
        setPasswordData={setPasswordData}
        error={null}
      />

      <DashboardStats stats={stats} />
      
      <DataTable 
        headers={headers} 
        data={dashboardData.ratings} 
        onSort={sortData}
        sortConfig={sortConfig}
      />
      
      <button className="logout-btn" onClick={logout}>Logout</button>
    </div>
  );
}

export default StoreOwnerDashboard;
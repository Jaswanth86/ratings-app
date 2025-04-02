import React, { useState, useEffect } from 'react';
import { getUserStores, submitRating, updateUserPassword, logout } from '../services/api';
import DataTable from '../components/DataTable';
import PasswordUpdate from '../components/PasswordUpdate';

function UserDashboard() {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [passwordData, setPasswordData] = useState({ current: '', new: '' });

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const data = await getUserStores();
      setStores(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async (storeId, rating) => {
    if (!rating || rating < 1 || rating > 5) {
      setError('Rating must be between 1 and 5');
      return;
    }
    setLoading(true);
    try {
      await submitRating({ storeId, rating });
      fetchStores();
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUserPassword({ currentPassword: passwordData.current, newPassword: passwordData.new });
      setPasswordData({ current: '', new: '' });
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const sortData = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
    const sorted = [...stores].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setStores(sorted);
  };

  if (loading) return <div className="loading">Loading...</div>;

  const headers = [
    { key: 'name', label: 'Name' },
    { key: 'address', label: 'Address' },
    { key: 'overall_rating', label: 'Overall Rating' },
    { key: 'user_rating', label: 'Your Rating' },
    { key: 'action', label: 'Action' }
  ];

  const tableData = stores
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || 
                s.address.toLowerCase().includes(search.toLowerCase()))
    .map(store => ({
      ...store,
      overall_rating: store.overall_rating?.toFixed(1),
      user_rating: store.user_rating || 'Not rated',
      action: (
        <select 
          onChange={(e) => handleSubmitRating(store.id, parseInt(e.target.value))}
          value={store.user_rating || ''}
        >
          <option value="">Rate</option>
          {[1, 2, 3, 4, 5].map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      )
    }));

  return (
    <div className="dashboard">
      <h2>User Dashboard</h2>
      {error && <div className="error">{error}</div>}
      
      <PasswordUpdate 
        onSubmit={handleUpdatePassword}
        passwordData={passwordData}
        setPasswordData={setPasswordData}
        error={null}
      />

      <input
        className="search-input"
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search stores..."
      />
      
      <DataTable 
        headers={headers} 
        data={tableData} 
        onSort={sortData}
        sortConfig={sortConfig}
      />
      
      <button className="logout-btn" onClick={logout}>Logout</button>
    </div>
  );
}

export default UserDashboard;
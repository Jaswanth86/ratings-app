import React from 'react';

function Filters({ filters, onChange, onApply }) {
  return (
    <div className="filters">
      <input name="name" value={filters.name} onChange={onChange} placeholder="Filter by name" />
      <input name="email" value={filters.email} onChange={onChange} placeholder="Filter by email" />
      <input name="address" value={filters.address} onChange={onChange} placeholder="Filter by address" />
      <select name="role" value={filters.role} onChange={onChange}>
        <option value="">All Roles</option>
        <option value="admin">Admin</option>
        <option value="user">User</option>
        <option value="store_owner">Store Owner</option>
      </select>
      <button onClick={onApply} className="action-btn">Apply Filters</button>
    </div>
  );
}

export default Filters;
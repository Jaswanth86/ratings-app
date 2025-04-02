import React from 'react';

function PasswordUpdate({ onSubmit, passwordData, setPasswordData, error }) {
  return (
    <div className="password-section">
      <h3>Update Password</h3>
      {error && <div className="error">{error}</div>}
      <form onSubmit={onSubmit}>
        <input
          type="password"
          value={passwordData.current}
          onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
          placeholder="Current Password"
          required
        />
        <input
          type="password"
          value={passwordData.new}
          onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
          placeholder="New Password"
          required
        />
        <button type="submit" className="action-btn">Update Password</button>
      </form>
    </div>
  );
}

export default PasswordUpdate;
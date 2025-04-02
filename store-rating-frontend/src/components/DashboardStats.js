import React from 'react';

function DashboardStats({ stats }) {
  return (
    <div className="stats">
      {Object.entries(stats).map(([key, value]) => (
        <div key={key}>
          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: {value || 'N/A'}
        </div>
      ))}
    </div>
  );
}

export default DashboardStats;
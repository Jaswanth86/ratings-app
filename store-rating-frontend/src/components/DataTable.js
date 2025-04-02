import React from 'react';

function DataTable({ headers, data, onSort, sortConfig }) {
  return (
    <table className="data-table">
      <thead>
        <tr>
          {headers.map(header => (
            <th 
              key={header.key} 
              onClick={() => onSort(header.key)}
            >
              {header.label}
              {sortConfig.key === header.key && (
                sortConfig.direction === 'asc' ? ' ↑' : ' ↓'
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index}>
            {headers.map(header => (
              <td key={header.key}>{item[header.key] || 'N/A'}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default DataTable;
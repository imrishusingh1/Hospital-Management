import React from 'react';

const Table = ({ columns, data, keyField = 'id', onRowClick }) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-gray-100 text-slate-500 text-sm font-semibold tracking-wide">
            {columns.map((col, i) => (
              <th key={i} className="px-6 py-4 whitespace-nowrap">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-500">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr 
                key={row[keyField] || i} 
                className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-slate-50' : ''}`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((col, j) => (
                  <td key={j} className="px-6 py-4 text-sm text-slate-700 whitespace-nowrap">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;

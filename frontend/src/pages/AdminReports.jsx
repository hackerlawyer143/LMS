import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../services/api';

export default function AdminReports() {
  const [revenue, setRevenue] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getAdminRevenue(), api.getAdminPayments()])
      .then(([rev, pay]) => {
        setRevenue(rev);
        setPayments(pay);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <h1>Payment Reports</h1>
      <Link to="/admin/users">Users</Link>

      <div className="card" style={{ marginTop: '1rem' }}>
        <h2>Total Revenue</h2>
        <p><strong>₹{revenue?.total ?? 0}</strong></p>
        {revenue?.byMonth?.length > 0 && (
          <ul>
            {revenue.byMonth.map((m) => (
              <li key={m.month}>{m.month}: ₹{m.total}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <h2>Payment History</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>ID</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>User</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Course</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Amount</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td style={{ padding: '0.5rem' }}>{p.id}</td>
                <td style={{ padding: '0.5rem' }}>{p.User?.full_name}</td>
                <td style={{ padding: '0.5rem' }}>{p.Course?.title}</td>
                <td style={{ padding: '0.5rem' }}>₹{p.amount}</td>
                <td style={{ padding: '0.5rem' }}>{p.status}</td>
                <td style={{ padding: '0.5rem' }}>{p.paid_at ? new Date(p.paid_at).toLocaleString() : p.created_at ? new Date(p.created_at).toLocaleString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

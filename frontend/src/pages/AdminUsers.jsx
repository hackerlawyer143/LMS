import React, { useState, useEffect } from 'react';
import * as api from '../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', full_name: '', role: 'student' });

  useEffect(() => {
    api.getUsers().then(setUsers).catch(() => setUsers([])).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createUser(form);
      setForm({ email: '', password: '', full_name: '', role: 'student' });
      setShowForm(false);
      api.getUsers().then(setUsers);
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const next = currentStatus === 'active' ? 'blocked' : 'active';
    try {
      await api.updateUserStatus(id, next);
      api.getUsers().then(setUsers);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <h1>Manage Users</h1>
      <button type="button" className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : 'Add User'}
      </button>
      {showForm && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Full name</label>
              <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Create</button>
          </form>
        </div>
      )}
      <div className="card" style={{ marginTop: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>ID</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Email</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Role</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={{ padding: '0.5rem' }}>{u.id}</td>
                <td style={{ padding: '0.5rem' }}>{u.full_name}</td>
                <td style={{ padding: '0.5rem' }}>{u.email}</td>
                <td style={{ padding: '0.5rem' }}>{u.role}</td>
                <td style={{ padding: '0.5rem' }}>{u.status}</td>
                <td style={{ padding: '0.5rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => toggleStatus(u.id, u.status)}>
                    {u.status === 'active' ? 'Block' : 'Unblock'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

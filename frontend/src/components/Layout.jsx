import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <nav>
        <Link to="/">Catalog</Link>
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            {user.role === 'admin' && (
              <>
                <Link to="/admin/users">Users</Link>
                <Link to="/admin/reports">Reports</Link>
              </>
            )}
            <button type="button" onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#e2e8f0', cursor: 'pointer' }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
      <main>
        <Outlet />
      </main>
    </>
  );
}

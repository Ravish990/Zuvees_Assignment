import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Layout({ token, setToken }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    navigate('/login');
  };

  if (!token) {
    navigate('/login');
    return null;
  }

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h2>Protected Layout Page</h2>
      <p>You are logged in!</p>
      <button onClick={handleLogout} style={{ padding: '10px 20px' }}>
        Logout
      </button>
    </div>
  );
}

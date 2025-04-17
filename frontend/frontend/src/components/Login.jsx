import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE = 'http://localhost:5000/api/auth'; // Absolute backend URL

export default function Login({ setToken }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  // Listen for messages from Google OAuth popup
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== 'http://localhost:5000') return; // Must match backend origin

      const { token } = event.data;

      if (token) {
        localStorage.setItem('token', token);
        setToken(token);
        navigate('/layout'); // Navigate after successful login
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [setToken, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setMessage(`Welcome, ${data.user.displayName || data.user.email}`);
        navigate('/layout');
      } else {
        setMessage(data.message || 'Login failed');
      }
    } catch {
      setMessage('Network error');
    }
  };

  const openGoogleOAuth = () => {
    const width = 500;
    const height = 600;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    window.open(
      `${API_BASE}/google`,
      'Google OAuth',
      `width=${width},height=${height},top=${top},left=${left}`
    );
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 10 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 10 }}
        />
        <button type="submit" style={{ width: '100%' }}>
          Login
        </button>
      </form>

      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <button onClick={openGoogleOAuth} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Login with Google
        </button>
      </div>

      {message && <p>{message}</p>}

      <p style={{ marginTop: 20 }}>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}

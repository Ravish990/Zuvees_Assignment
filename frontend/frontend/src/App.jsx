import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/Login';
import OAuthSuccess from './components/OAuthSuccess';
import Register from './components/Register';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={token ? "/layout" : "/login"} replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/oauth/success" element={<OAuthSuccess setToken={setToken} />} />
        <Route path="/layout" element={<Layout token={token} setToken={setToken} />} />
      </Routes>
    </Router>
  );
}

export default App;

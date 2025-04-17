import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const OAuthSuccess = ({ setToken }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('token', token);
      setToken(token);
      navigate('/layout'); // Navigate to layout
    } else {
      navigate('/login'); // Redirect to login if no token
    }
  }, [location, navigate, setToken]);

  return <div>Logging you in...</div>;
};

export default OAuthSuccess;

import React from 'react';
import AuthForm from '../components/AuthForm';
import { useNavigate } from 'react-router-dom';

function Auth({ onLogin }) {
  const navigate = useNavigate();

  const handleLoginSuccess = (user, token) => {
    onLogin(user, token);
    navigate('/dashboard');
  };

  return (
    <div className="container">
      <AuthForm onLogin={handleLoginSuccess} />
    </div>
  );
}

export default Auth;
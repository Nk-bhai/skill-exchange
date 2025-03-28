import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProfileImg from '../assets/profile-placeholder.png'

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">Skill Exchange</Link>
        <div className="navbar-links">
          <Link to="/" className="navbar-link">Home</Link>
          <Link to="/skills" className="navbar-link">Skills</Link>
          <Link to="/dashboard" className="navbar-link">My Sessions</Link>
          {user ? (
            <>
              <Link to={`/profile/${user.id}`} className="navbar-link profile-link">
                <img src={ProfileImg} alt="Profile" className="navbar-profile-image" />
                {user.username}
              </Link>
              <button onClick={handleLogout} className="navbar-link logout-btn">Logout</button>
            </>
          ) : (
            <Link to="/auth" className="navbar-link">Login/Register</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';
import logo from '../assets/Logo.png';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="DeepFake Detective" className="logo-image" />
          <span>DeepFake Detective</span>
        </Link>
        
        <div className="menu-icon" onClick={() => setIsOpen(!isOpen)}>
          <i className={isOpen ? 'fas fa-times' : 'fas fa-bars'} />
        </div>
        
        <ul className={isOpen ? 'nav-menu active' : 'nav-menu'}>
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={() => setIsOpen(false)}>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/about" className="nav-link" onClick={() => setIsOpen(false)}>
              About Deepfakes
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/detector" className="nav-link" onClick={() => setIsOpen(false)}>
              Detector
            </Link>
          </li>
          {currentUser ? (
            <li className="nav-item">
              <button className="nav-button logout-button" onClick={handleLogout}>
                Logout
              </button>
            </li>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-button login-button" onClick={() => setIsOpen(false)}>
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/signup" className="nav-button signup-button" onClick={() => setIsOpen(false)}>
                  Sign Up
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
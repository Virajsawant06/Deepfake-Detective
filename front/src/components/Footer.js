
import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>DeepFake Detective</h3>
          <p>Cutting-edge AI technology for deepfake detection</p>
        </div>
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About Deepfakes</a></li>
            <li><a href="/detector">Detector</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Connect</h3>
          <div className="social-icons">
            <a href="#" className="social-icon"><i className="fab fa-twitter"></i></a>
            <a href="#" className="social-icon"><i className="fab fa-linkedin"></i></a>
            <a href="#" className="social-icon"><i className="fab fa-github"></i></a>
          </div>
        </div>
      </div>
      <div className="copyright">
        <p>&copy; {new Date().getFullYear()} DeepFake Detective. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
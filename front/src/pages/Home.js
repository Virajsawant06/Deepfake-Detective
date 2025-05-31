import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import header from '../assets/header.png'
import { 
  ArrowRight, 
  Shield, 
  Zap, 
  UserCheck, 
  Upload, 
  CheckCircle 
} from 'react-feather'; // You can use react-feather or any other icon library

function Home() {
  return (
    <div className="home-container">
      <section className="hero">
        <div className="hero-content">
          <h1>Detect Deepfakes with AI Precision</h1>
          <p>Our advanced AI model helps identify manipulated videos with high accuracy.</p>
          <div className="hero-buttons">
            <Link to="/detector" className="primary-button">
              Try Detector <ArrowRight size={16} />
            </Link>
            <Link to="/about" className="secondary-button">
              Learn More
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <img src={header} alt="AI Detection Illustration" />
        </div>
      </section>

      <section className="features">
        <h2>Why Use Our Deepfake Detector?</h2>
        <div className="feature-cards">
          <div className="feature-card">
            <div className="feature-icon">
              <Shield />
            </div>
            <h3>High Accuracy</h3>
            <p>Our model uses state-of-the-art deep learning techniques to achieve high detection rates.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Zap />
            </div>
            <h3>Real-time Analysis</h3>
            <p>Quick processing of video content with frame-by-frame analysis.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <UserCheck />
            </div>
            <h3>Privacy Focused</h3>
            <p>Your videos are processed securely and never stored in our systems.</p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Upload Video</h3>
            <p>Upload the video file you want to analyze</p>
            <div className="step-icon">
              <Upload />
            </div>
          </div>
          <div className="step-arrow">
            <ArrowRight />
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>AI Processing</h3>
            <p>Our model analyzes facial features and inconsistencies</p>
            <div className="step-icon">
              <Shield />
            </div>
          </div>
          <div className="step-arrow">
            <ArrowRight />
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Get Results</h3>
            <p>Receive detailed analysis and authenticity score</p>
            <div className="step-icon">
              <CheckCircle />
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="cta-content">
          <h2>Start Detecting Deepfakes Today</h2>
          <p>Join thousands of users protecting themselves from misinformation.</p>
          <Link to="/signup" className="cta-button">Sign Up for Free</Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
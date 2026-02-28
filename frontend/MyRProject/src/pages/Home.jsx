import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Home.css';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Integrated Waste Management Issue Reporting System</h1>
        <p>Report, track, and resolve sanitation issues with faster community-government coordination.</p>
        
        {isAuthenticated ? (
          <div className="hero-buttons">
            <Link to="/dashboard" className="btn btn-primary">
              Go to Dashboard
            </Link>
            {user?.role === 'citizen' && (
              <Link to="/report-waste" className="btn btn-secondary">
                Report Waste
              </Link>
            )}
          </div>
        ) : (
          <div className="hero-buttons">
            <Link to="/login" className="btn btn-primary">
              Login
            </Link>
            <Link to="/register" className="btn btn-secondary">
              Register
            </Link>
          </div>
        )}
      </div>

      <div className="features-section">
        <h2>How it works</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Report Waste</h3>
            <p>Easily report waste issues in your area with photos and details</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Community Driven</h3>
            <p>Join thousands of community members helping keep areas clean</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Fast Response</h3>
            <p>Officers respond quickly to reported waste issues</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Track Progress</h3>
            <p>Monitor report status from pending to resolved</p>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <h2>Get Started Today</h2>
        <p>Make a difference in your community</p>
        {!isAuthenticated && (
          <Link to="/register" className="btn btn-primary btn-large">
            Create an Account
          </Link>
        )}
      </div>
    </div>
  );
};

export default Home;


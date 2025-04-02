// src/pages/LandingPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Auth.css'; // Reuse Auth.css for consistent styling

function LandingPage() {
  return (
    <div className="auth-container">
      <h2>Welcome to Store Rating App</h2>
      <p>Please choose an option to proceed:</p>
      <div className="landing-buttons">
        <Link to="/login">
          <button>Login</button>
        </Link>
        <Link to="/signup">
          <button>Signup</button>
        </Link>
      </div>
    </div>
  );
}

export default LandingPage;
import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Login functionality would connect to a backend.');
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your SnapDent India account</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field-group">
            <label className="auth-label">Email Address</label>
            <input 
              type="email" 
              className="auth-input" 
              placeholder="you@example.com" 
              required
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>
          <div className="auth-field-group">
            <label className="auth-label">Password</label>
            <input 
              type="password" 
              className="auth-input" 
              placeholder="••••••••" 
              required
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>
          <div className="auth-field-group auth-options">
            <label className="auth-remember">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="#" className="auth-forgot">Forgot password?</a>
          </div>
          <div className="auth-field-group">
            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '52px' }}>
              Sign In
            </button>
          </div>
        </form>
        <p className="auth-footer-text">
          Don't have an account? <Link to="/signup" className="auth-link">Sign Up</Link>
        </p>
      </div>
    </main>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

export default function Signup() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirm: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm) {
      alert('Passwords do not match');
      return;
    }
    alert('Registration functionality would connect to a backend.');
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join SnapDent India for exclusive access</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field-group">
            <label className="auth-label">Full Name</label>
            <input 
              type="text" 
              className="auth-input" 
              placeholder="Your full name" 
              required
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>
          <div className="auth-field-group">
            <label className="auth-label">Email Address</label>
            <input 
              type="email" 
              className="auth-input" 
              placeholder="you@example.com" 
              required
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
            />
          </div>
          <div className="auth-field-group">
            <label className="auth-label">Password</label>
            <input 
              type="password" 
              className="auth-input" 
              placeholder="Create a password" 
              required
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
            />
          </div>
          <div className="auth-field-group">
            <label className="auth-label">Confirm Password</label>
            <input 
              type="password" 
              className="auth-input" 
              placeholder="Confirm your password" 
              required
              value={formData.confirm} 
              onChange={e => setFormData({...formData, confirm: e.target.value})} 
            />
          </div>
          <div className="auth-field-group">
            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '52px', marginTop: '10px' }}>
              Create Account
            </button>
          </div>
        </form>
        <p className="auth-footer-text">
          Already have an account? <Link to="/login" className="auth-link">Sign In</Link>
        </p>
      </div>
    </main>
  );
}

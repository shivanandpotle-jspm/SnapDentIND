import { useState } from 'react';
import { post } from '../api/client';
import { heroImages } from '../data/products';
import './Contact.css';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await post('/contact', formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      setError(err.message || 'Failed to send message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="contact-page container-max section-gap animate-fade-in-up">
      <div className="contact-header">
        <span className="about-label">Get In Touch</span>
        <h1 className="contact-title">Contact <span className="hero__accent">Us</span></h1>
        <p className="contact-subtitle">Have questions about our products? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
      </div>

      <div className="contact-grid">
        {/* Form */}
        <div className="contact-form-wrap card-elevated">
          {submitted ? (
            <div className="contact-success animate-scale-in">
              <span className="material-symbols-outlined" style={{ fontSize: 56, color: '#16a34a' }}>check_circle</span>
              <h3>Message Sent!</h3>
              <p>We'll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="contact-form-row">
                <div className="contact-field">
                  <label className="sidebar-label">Full Name</label>
                  <input type="text" className="input-field" placeholder="Your name" required
                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="contact-field">
                  <label className="sidebar-label">Email</label>
                  <input type="email" className="input-field" placeholder="you@example.com" required
                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
              </div>
              <div className="contact-field">
                <label className="sidebar-label">Subject</label>
                <input type="text" className="input-field" placeholder="How can we help?" required
                  value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} />
              </div>
              <div className="contact-field">
                <label className="sidebar-label">Message</label>
                <textarea className="input-field contact-textarea" placeholder="Tell us more..." rows={5} required
                  value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} />
              </div>
              {error && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>{error}</p>}
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>

        {/* Contact Info */}
        <div className="contact-info">
          <div className="contact-info-card card">
            <span className="material-symbols-outlined contact-info-icon">location_on</span>
            <h4>Visit Us</h4>
            <p>Mumbai, Maharashtra<br />India</p>
          </div>
          <div className="contact-info-card card">
            <span className="material-symbols-outlined contact-info-icon">mail</span>
            <h4>Email Us</h4>
            <p>support@snapdent.in</p>
          </div>
          <div className="contact-info-card card">
            <span className="material-symbols-outlined contact-info-icon">phone</span>
            <h4>Call Us</h4>
            <p>+91 96652 00527</p>
          </div>
          <div className="contact-map">
            <img src={heroImages.contact} alt="Office Location" />
          </div>
        </div>
      </div>
    </main>
  );
}

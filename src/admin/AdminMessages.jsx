import { useState, useEffect } from 'react';
import { getContactMessages, markMessageAsRead } from '../api/contact';
import './Admin.css';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMessage, setViewMessage] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await getContactMessages();
      setMessages(data.messages);
    } catch (error) {
      console.error('Failed to load messages', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markMessageAsRead(id);
      setMessages(messages.map(m => m._id === id ? { ...m, isRead: true } : m));
      if (viewMessage && viewMessage._id === id) {
        setViewMessage({ ...viewMessage, isRead: true });
      }
    } catch (error) {
      console.error('Failed to mark message as read', error);
    }
  };

  const openMessage = (msg) => {
    setViewMessage(msg);
    if (!msg.isRead) {
      handleMarkAsRead(msg._id);
    }
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading messages...</div>;
  }

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Contact Messages</h1>
          <p>View and manage responses from the contact form.</p>
        </div>
      </div>

      <div className="admin-table-wrap animate-fade-in-up">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Name</th>
                <th>Email</th>
                <th>Subject</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="admin-empty-state">
                      <span className="material-symbols-outlined">inbox</span>
                      <h3>No messages found</h3>
                      <p>Your inbox is clean!</p>
                    </div>
                  </td>
                </tr>
              ) : messages.map(msg => (
                <tr key={msg._id} style={{ fontWeight: msg.isRead ? 'normal' : 'bold', background: msg.isRead ? 'transparent' : 'var(--admin-sidebar-bg)' }}>
                  <td>
                    <span className={`admin-badge ${msg.isRead ? 'admin-badge--inactive' : 'admin-badge--active'}`}>
                      {msg.isRead ? 'Read' : 'New'}
                    </span>
                  </td>
                  <td>{msg.name}</td>
                  <td>{msg.email}</td>
                  <td>{msg.subject}</td>
                  <td style={{ color: 'var(--admin-text-muted)', fontSize: 13 }}>{new Date(msg.createdAt).toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button className="admin-btn admin-btn--icon" title="View details" onClick={() => openMessage(msg)}>
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message Details Modal */}
      {viewMessage && (
        <div className="admin-modal-overlay" onClick={() => setViewMessage(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h3>Message Details</h3>
              <button className="admin-btn admin-btn--icon" onClick={() => setViewMessage(null)} style={{ border: 'none', background: 'transparent' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="admin-modal__body">
              <div style={{ marginBottom: 16 }}>
                <strong>From:</strong> {viewMessage.name} ({viewMessage.email})
              </div>
              <div style={{ marginBottom: 16 }}>
                <strong>Date:</strong> {new Date(viewMessage.createdAt).toLocaleString()}
              </div>
              <div style={{ marginBottom: 16 }}>
                <strong>Subject:</strong> {viewMessage.subject}
              </div>
              <div>
                <strong>Message:</strong>
                <p style={{ marginTop: 8, padding: 16, background: 'var(--admin-sidebar-bg)', borderRadius: 8, whiteSpace: 'pre-wrap' }}>
                  {viewMessage.message}
                </p>
              </div>
            </div>
            <div className="admin-modal__footer">
              <button className="admin-btn admin-btn--primary" onClick={() => setViewMessage(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

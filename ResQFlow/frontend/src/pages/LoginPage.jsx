import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Info } from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('admin@resqflow.gov.in');
  const [password, setPassword] = useState('admin123');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await login(email, password);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setFormError(err.message || 'Login failed. Please verify credentials.');
    }
  };

  const setDemoCredentials = (role) => {
    if (role === 'admin') {
      setEmail('admin@resqflow.gov.in');
      setPassword('admin123');
    } else {
      setEmail('analyst@resqflow.gov.in');
      setPassword('demo123');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-app)',
      padding: '1.5rem',
      background: 'radial-gradient(circle at 10% 20%, #e0f2fe 0%, #f8fafc 90%)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
      }}>
        {/* Gov Header Banner */}
        <div style={{
          backgroundColor: 'var(--navy-dark)',
          color: '#ffffff',
          padding: '2rem 1.75rem 1.75rem',
          textAlign: 'center',
          position: 'relative',
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--teal-primary), var(--sky-blue))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 4px 12px rgba(13, 148, 136, 0.4)',
          }}>
            <ShieldCheck size={32} color="#ffffff" />
          </div>

          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
            ResQFlow
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#93c5fd', marginTop: '0.35rem', fontWeight: 500 }}>
            Disaster Impact & Relief Resource Analyser
          </p>
          <div style={{
            display: 'inline-block',
            marginTop: '0.85rem',
            padding: '3px 10px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '9999px',
            fontSize: '0.68rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: '#e2e8f0',
          }}>
            State Emergency Operations Command
          </div>
        </div>

        {/* Login Form */}
        <div style={{ padding: '2rem 1.75rem' }}>
          {(formError || error) && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--critical-bg)',
              color: 'var(--critical-text)',
              border: '1px solid var(--critical-border)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.25rem',
              fontSize: '0.82rem',
            }}>
              <AlertCircle size={16} />
              <span>{formError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email-input">
                Official Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="email-input"
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="officer@resqflow.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" htmlFor="password-input">
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password-input"
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
              </div>
            </div>

            <button
              id="login-btn"
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }}
              disabled={loading}
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Operations Portal'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Demo Helper */}
          <div style={{
            marginTop: '1.75rem',
            padding: '1rem',
            backgroundColor: 'var(--bg-light-blue)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--sky-border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy-primary)', marginBottom: '0.5rem' }}>
              <Info size={14} />
              <span>DEMO EVALUATOR CREDENTIALS</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Click to autofill pre-configured disaster response credentials:
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ flex: 1, fontSize: '0.73rem', backgroundColor: '#fff' }}
                onClick={() => setDemoCredentials('admin')}
              >
                State Controller
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ flex: 1, fontSize: '0.73rem', backgroundColor: '#fff' }}
                onClick={() => setDemoCredentials('analyst')}
              >
                Logistics Analyst
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div style={{
          padding: '0.85rem 1.75rem',
          backgroundColor: '#f8fafc',
          borderTop: '1px solid var(--border-light)',
          textAlign: 'center',
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
        }}>
          Government Disaster Response System &bull; Secure Protocol
        </div>
      </div>
    </div>
  );
}

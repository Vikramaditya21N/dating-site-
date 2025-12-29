import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../Config'; // Centralized Config

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success Logic
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        toast.success(`Welcome back, ${data.user.firstName}! 🌹`);
        
        // Use navigate for a SPA experience instead of window.location
        navigate('/dashboard'); 
      } else {
        toast.error(data.message || 'Invalid email or password');
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Server connection failed. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <form className="form" onSubmit={handleSubmit} style={styles.formCard}>
        <h2>Welcome Back, Love</h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Your perfect match is waiting. Let's continue your romantic journey.
        </p>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Email Address</label>
          <input
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            style={styles.input}
          />
        </div>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <input
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            style={styles.input}
          />
        </div>

        <div style={styles.row}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <label htmlFor="remember" style={styles.checkboxLabel}>Remember me</label>
          </div>
          <Link to="/forgot-password" style={styles.forgotPass}>Forgot password?</Link>
        </div>

        <button 
          type="submit" 
          className="swipe-btn" 
          disabled={isLoading}
          style={styles.submitBtn}
        >
          {isLoading ? <div className="loader" style={{ width: '20px', height: '20px' }}></div> : 'Sign In'}
        </button>

        <p style={styles.footerText}>
          Don't have an account? 🌹 <Link to="/signup" style={styles.link}>Sign up here</Link>
        </p>
      </form>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  formCard: { 
    background: 'white', 
    padding: '40px', 
    borderRadius: '20px', 
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
    width: '100%',
    maxWidth: '450px'
  },
  inputGroup: { marginBottom: '20px', textAlign: 'left' },
  label: { display: 'block', marginBottom: '8px', fontWeight: '600', color: '#444', fontSize: '0.9rem' },
  input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '1rem' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
  checkboxLabel: { marginLeft: '8px', fontSize: '0.9rem', color: '#666', cursor: 'pointer' },
  forgotPass: { fontSize: '0.85rem', color: '#e91e63', textDecoration: 'none' },
  submitBtn: { width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '12px' },
  footerText: { textAlign: 'center', marginTop: '20px', fontSize: '0.95rem', color: '#777' },
  link: { color: '#e91e63', fontWeight: 'bold', textDecoration: 'none' }
};

export default Login;
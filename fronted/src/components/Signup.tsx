import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../Config'; // Centralized Config

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: '',
    bio: '',
    interests: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match! ❌');
      return;
    }

    setIsLoading(true);

    try {
      // 2. API Call using centralized URL
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          age: Number(formData.age),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Welcome to WINK! Your account has been created. 🌹');
        navigate('/login'); 
      } else {
        toast.error(data.message || 'Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Server connection failed. Check if backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container signup-container" style={styles.pageWrapper}>
      <form className="form" onSubmit={handleSubmit} style={styles.formCard}>
        <h2 style={styles.heading}>Begin Your Love Story</h2>
        <p style={styles.subheading}>Join our community of dreamers and find the love you've always imagined.</p>

        <div style={styles.row}>
          <div style={styles.flex1}>
            <label style={styles.label}>First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First name"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.flex1}>
            <label style={styles.label}>Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last name"
              required
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
            style={styles.input}
          />
        </div>

        <div style={styles.row}>
          <div style={styles.flex1}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create password"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.flex1}>
            <label style={styles.label}>Confirm</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm"
              required
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.flex1}>
            <label style={styles.label}>Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Min 18"
              min="18"
              max="99"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.flex1}>
            <label style={styles.label}>Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange} required style={styles.input}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
            </select>
          </div>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>About You</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="What makes you unique?"
            rows={3}
            style={styles.textarea}
          />
        </div>

        <button type="submit" className="swipe-btn" disabled={isLoading} style={styles.submitBtn}>
          {isLoading ? <div className="loader" style={{width: '20px', height: '20px'}}></div> : 'Create Account'}
        </button>

        <p style={styles.footerText}>
          Already have an account? 🌹 <Link to="/login" style={styles.link}>Sign in here</Link>
        </p>
      </form>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  pageWrapper: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh', padding: '20px' },
  formCard: { background: 'white', padding: '40px', borderRadius: '25px', boxShadow: '0 15px 35px rgba(0,0,0,0.1)', maxWidth: '550px', width: '100%' },
  heading: { textAlign: 'center', color: '#e91e63', fontWeight: '800' },
  subheading: { textAlign: 'center', color: '#666', marginBottom: '25px', fontSize: '0.95rem' },
  row: { display: 'flex', gap: '15px', marginBottom: '15px' },
  flex1: { flex: 1 },
  inputGroup: { marginBottom: '15px' },
  label: { display: 'block', marginBottom: '5px', fontWeight: '600', color: '#444', fontSize: '0.85rem' },
  input: { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #eee', fontSize: '1rem', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #eee', fontSize: '1rem', boxSizing: 'border-box', resize: 'none' },
  submitBtn: { width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '14px', marginTop: '10px' },
  footerText: { textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: '#777' },
  link: { color: '#e91e63', fontWeight: 'bold', textDecoration: 'none' }
};

export default Signup;
import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="container home">
      {/* Visual Hero Section */}
      <div style={styles.heroWrapper}>
        <span style={styles.roseIcon}> 🌹 </span>
      </div>
      
      <div style={{ textAlign: 'center' }}>
        <h2>Find Your Perfect Match</h2>
        
        <p style={styles.mainDescription}>
          Where hearts connect and love blossoms in the most beautiful ways.
        </p>
        
        <p style={styles.quote}>
          "Love is not just looking at each other, it's looking in the same direction" 💫
        </p>
      </div>

      {/* Action Buttons */}
      <div style={styles.buttonGroup}>
        <Link 
          to="/login" 
          className="swipe-btn"
          style={styles.signInBtn}
        >
          Sign In
        </Link>
        
        <Link 
          to="/signup" 
          className="swipe-btn"
          style={styles.signUpBtn}
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  heroWrapper: { 
    textAlign: 'center', 
    marginBottom: '1.5rem',
    animation: 'romanticFadeIn 1s ease-out'
  },
  roseIcon: { 
    fontSize: '5rem',
    display: 'inline-block',
    filter: 'drop-shadow(0 4px 10px rgba(233, 30, 99, 0.3))'
  },
  mainDescription: { 
    fontSize: '1.2rem', 
    color: '#444', 
    maxWidth: '500px', 
    margin: '0 auto' 
  },
  quote: { 
    fontSize: '1rem', 
    marginTop: '1.5rem', 
    fontStyle: 'italic', 
    color: '#e91e63',
    opacity: 0.8
  },
  buttonGroup: { 
    marginTop: '3rem', 
    display: 'flex', 
    gap: '20px', 
    justifyContent: 'center' 
  },
  signInBtn: { 
    textDecoration: 'none', 
    padding: '14px 40px', 
    borderRadius: '50px', 
    backgroundColor: '#fff', 
    color: '#e91e63', 
    border: '2px solid #e91e63', 
    fontWeight: 'bold',
    display: 'inline-block'
  },
  signUpBtn: { 
    textDecoration: 'none', 
    padding: '14px 40px', 
    borderRadius: '50px', 
    backgroundColor: '#e91e63', 
    color: '#fff', 
    border: '2px solid #e91e63', 
    fontWeight: 'bold',
    display: 'inline-block',
    boxShadow: '0 4px 15px rgba(233, 30, 99, 0.3)'
  }
};

export default Home;
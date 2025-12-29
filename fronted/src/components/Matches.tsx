import React, { useEffect, useState } from 'react';
import UserCard from './UserCard';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../Config'; // Centralized Config

const Matches: React.FC = () => {
  const [matchList, setMatchList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Move fetch logic into an effect-safe function
    const fetchMatches = async () => {
      try {
        const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = loggedInUser.id || loggedInUser._id;

        if (!userId) return;

        // 2. Use API_BASE_URL for deployment readiness
        const response = await fetch(`${API_BASE_URL}/api/auth/matches?userId=${userId}`);
        const data = await response.json();
        
        if (response.ok && Array.isArray(data)) {
          setMatchList(data);
        }
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMatches();
  }, []);

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <div className="loader"></div>
        <p style={{ marginTop: '15px', color: '#e91e63', fontWeight: 'bold' }}>Finding your connections... 💖</p>
      </div>
    );
  }

  return (
    <div className="matches-container">
      <header style={styles.header}>
        <h1 style={styles.title}>Your Gallery</h1>
        <p style={styles.subtitle}>People who liked you back. Time to say hello!</p>
      </header>
      
      {matchList.length > 0 ? (
        <div className="gallery-grid">
          {matchList.map((user: any) => (
            <div key={user._id} className="match-card-wrapper">
              <span className="match-badge">Matched ✨</span>
              <UserCard user={user} />
              <button 
                className="chat-btn swipe-btn" // Added swipe-btn for consistent feel
                onClick={() => navigate(`/chat/${user._id}`)}
                style={styles.chatButton}
              >
                Send Message 💬
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <div style={{ fontSize: '4rem' }}>🏜️</div>
          <h3>The gallery is quiet...</h3>
          <p>Keep winking at people in Discovery to find your match!</p>
          <button 
            className="swipe-btn"
            onClick={() => navigate('/dashboard')}
            style={styles.discoveryBtn}
          >
            Go to Discovery
          </button>
        </div>
      )}
    </div>
  );
};

// 3. Clean and structured styles
const styles: Record<string, React.CSSProperties> = {
  loaderContainer: { 
    display: 'flex', flexDirection: 'column', alignItems: 'center', 
    justifyContent: 'center', height: '70vh' 
  },
  header: { textAlign: 'center', marginBottom: '40px' },
  title: { color: '#e91e63', fontSize: '2.5rem', marginBottom: '10px', fontWeight: '800' },
  subtitle: { color: '#666', fontSize: '1.1rem' },
  chatButton: { 
    borderRadius: '0 0 12px 12px', marginTop: '-5px', 
    padding: '15px', fontSize: '1rem' 
  },
  emptyState: { textAlign: 'center', marginTop: '100px', padding: '20px' },
  discoveryBtn: { 
    marginTop: '25px', padding: '12px 30px', borderRadius: '30px', 
    border: '2px solid #e91e63', color: '#e91e63', background: 'white', 
    fontWeight: 'bold', cursor: 'pointer' 
  }
};

export default Matches;
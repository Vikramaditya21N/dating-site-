import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../Config';

const Browse: React.FC = () => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Get current user ID to avoid showing yourself in the list
  const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
  const myId = loggedInUser.id || loggedInUser._id;

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/users?currentUserId=${myId}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setProfiles(data);
        }
      } catch (err) {
        console.error("Failed to fetch profiles:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [myId]);

  if (loading) {
    return (
      <div className="container browse" style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="container browse">
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2>Discover Your Soulmate</h2>
        <p style={{ color: '#666' }}>Scroll through the community and find a spark.</p>
      </header>

      {profiles.length > 0 ? (
        <div style={styles.grid}>
          {profiles.map((profile) => (
            <div key={profile._id} className="profile-card" style={styles.cardCustom}>
              <div 
                style={{ 
                  ...styles.imageHeader, 
                  backgroundImage: `url(${profile.image || 'https://via.placeholder.com/300'})` 
                }} 
              />
              <div style={{ padding: '15px' }}>
                <h3 style={{ margin: '0 0 5px 0' }}>{profile.firstName}, {profile.age}</h3>
                <p style={{ fontSize: '0.9rem', color: '#555', minHeight: '40px' }}>
                  {profile.bio ? (profile.bio.substring(0, 80) + '...') : "No bio available."}
                </p>
                <button 
                  onClick={() => navigate(`/chat/${profile._id}`)}
                  style={{ width: '100%', marginTop: '10px' }}
                >
                  Send Love Letter
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h3>No profiles found 🏜️</h3>
          <p>Try again later!</p>
        </div>
      )}
    </div>
  );
};

// Internal styles to keep CSS clean
const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '20px',
  },
  cardCustom: {
    margin: 0, // Override original margin
    padding: 0, // Let the image take full width at top
    overflow: 'hidden',
  },
  imageHeader: {
    height: '200px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderBottom: '1px solid #eee'
  }
};

export default Browse;
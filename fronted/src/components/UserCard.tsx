import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../Config'; // Centralized Config

interface UserCardProps {
  user: {
    _id: string;
    firstName: string;
    lastName?: string;
    age: number;
    bio?: string;
    interests?: string;
    image?: string; // Support for images
  };
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [isWinked, setIsWinked] = useState(false);
  const navigate = useNavigate();

  const handleWink = async () => {
    setLoading(true);
    try {
      const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
      const myId = loggedInUser.id || loggedInUser._id;

      if (!myId) {
        toast.error("Please login to wink! 🌹");
        return;
      }

      // Using centralized API_BASE_URL for deployment
      const response = await fetch(`${API_BASE_URL}/api/auth/wink`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ myId, targetUserId: user._id }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.match) {
          // Professional Match Notification
          toast.success(`💖 It's a Match with ${user.firstName}!`, {
            onClick: () => navigate(`/chat/${user._id}`),
            autoClose: 5000,
          });
          setIsWinked(true);
        } else {
          toast.info(data.message || "Wink sent! 😉");
          setIsWinked(true);
        }
      } else {
        toast.error(data.message || "Failed to wink");
      }
    } catch (err) {
      console.error("Wink Error:", err);
      toast.error("Server connection lost. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      {/* Profile Image with Fallback */}
      <div style={styles.imageContainer}>
        {user.image ? (
          <img src={user.image} alt={user.firstName} style={styles.profileImg} />
        ) : (
          <div style={styles.placeholderImg}>👤</div>
        )}
      </div>

      <div style={styles.content}>
        <h3 style={styles.name}>{user.firstName}, {user.age}</h3>
        <p style={styles.bio}>
          {user.bio ? (user.bio.length > 70 ? `${user.bio.substring(0, 70)}...` : user.bio) : "No bio added yet."}
        </p>
        
        <button 
          onClick={handleWink}
          disabled={loading || isWinked}
          className="swipe-btn"
          style={{
            ...styles.button,
            backgroundColor: isWinked ? '#4CAF50' : (loading ? '#ccc' : '#e91e63'),
            cursor: (loading || isWinked) ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Sending...' : (isWinked ? 'Winked! ✔' : 'Wink 😉')}
        </button>
      </div>
    </div>
  );
};

// Structured styles for better performance
const styles: Record<string, React.CSSProperties> = {
  card: {
    border: '1px solid #f0f0f0',
    borderRadius: '16px',
    margin: '10px',
    textAlign: 'center',
    boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
    backgroundColor: '#fff',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
  },
  imageContainer: {
    height: '180px',
    backgroundColor: '#fff5f8',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  profileImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  placeholderImg: { fontSize: '4rem' },
  content: { padding: '20px' },
  name: { margin: '0 0 8px 0', color: '#333', fontSize: '1.25rem', fontWeight: '700' },
  bio: { color: '#666', fontSize: '0.9rem', minHeight: '40px', lineHeight: '1.4' },
  button: {
    color: 'white',
    border: 'none',
    padding: '12px',
    borderRadius: '25px',
    fontWeight: 'bold',
    marginTop: '15px',
    width: '100%',
  }
};

export default UserCard;
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchedUser: {
    _id: string;
    firstName: string;
    image: string;
  } | null;
}

const MatchModal: React.FC<MatchModalProps> = ({ isOpen, onClose, matchedUser }) => {
  const navigate = useNavigate();
  
  // Safely parse user data
  const myUser = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);

  if (!isOpen || !matchedUser) return null;

  const handleChatNavigation = () => {
    onClose();
    navigate(`/chat/${matchedUser._id}`);
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      {/* stopPropagation prevents closing the modal when clicking inside the pink box */}
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>🌹 It's a Match! 🌹</div>
        <p style={styles.text}>You and **{matchedUser.firstName}** liked each other.</p>
        
        <div style={styles.imageWrapper}>
          <img 
            src={myUser.image || 'https://via.placeholder.com/100'} 
            alt="Me" 
            style={styles.avatar} 
          />
          <div className="heart-pulse" style={styles.heartIcon}>❤️</div>
          <img 
            src={matchedUser.image || 'https://via.placeholder.com/100'} 
            alt="Match" 
            style={styles.avatar} 
          />
        </div>

        <button 
          onClick={handleChatNavigation} 
          className="swipe-btn"
          style={styles.chatBtn}
        >
          Send a Message
        </button>
        
        <button 
          onClick={onClose} 
          style={styles.keepSwipingBtn}
        >
          Keep Swiping
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0,
    backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center',
    alignItems: 'center', zIndex: 9999, padding: '20px'
  },
  modal: {
    background: 'linear-gradient(135deg, #e91e63 0%, #ff4081 100%)',
    padding: '40px 20px', borderRadius: '30px', width: '100%', maxWidth: '400px',
    textAlign: 'center', color: 'white', boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
    animation: 'romanticFadeIn 0.5s ease-out'
  },
  header: { fontSize: '2.2rem', fontWeight: '800', marginBottom: '10px', letterSpacing: '-0.5px' },
  text: { marginBottom: '35px', fontSize: '1.1rem', opacity: 0.9 },
  imageWrapper: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginBottom: '40px' },
  avatar: { 
    width: '100px', height: '100px', borderRadius: '50%', 
    objectFit: 'cover', border: '4px solid white', 
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)' 
  },
  heartIcon: { fontSize: '2.5rem', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))' },
  chatBtn: {
    width: '100%', padding: '16px', borderRadius: '50px', border: 'none',
    backgroundColor: 'white', color: '#e91e63', fontWeight: 'bold',
    fontSize: '1.1rem', cursor: 'pointer', marginBottom: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
  },
  keepSwipingBtn: {
    backgroundColor: 'transparent', border: 'none', color: 'white',
    textDecoration: 'underline', cursor: 'pointer', fontSize: '1rem', opacity: 0.8
  }
};

export default MatchModal;
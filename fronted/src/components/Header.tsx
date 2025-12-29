import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { socket } from '../socket';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  // Memoize user data to prevent unnecessary re-renders
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const myId = user.id || user._id;

  // Stable logout handler
  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUnreadCount(0);
    socket.disconnect();
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    if (token && myId) {
      if (!socket.connected) socket.connect();
      socket.emit('join_room', myId);

      const handleNotification = (data: any) => {
        setUnreadCount((prev) => prev + 1);

        // Sound effect
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
        audio.play().catch(() => {});

        // Styled Toast
        toast.info(`🌹 ${data.from}: ${data.text}`, {
          icon: () => <span>💌</span>,
          onClick: () => navigate(`/chat/${data.fromId || data.id}`),
          style: {
            borderRadius: '12px',
            background: '#ffffff', // Clean background
            color: '#333',
            borderLeft: '6px solid #e91e63',
            cursor: 'pointer',
            fontWeight: '600'
          }
        });
      };

      socket.on('new_notification', handleNotification);

      return () => {
        socket.off('new_notification', handleNotification);
      };
    }
  }, [token, myId, navigate]);

  return (
    <nav className="navbar" style={styles.nav}>
      <Link to="/dashboard" style={styles.logo}>
        WINK 🌹
      </Link>

      <div className="nav-links" style={styles.linksWrapper}>
        {token ? (
          <>
            <Link to="/dashboard" style={styles.link}>Discovery</Link>
            <Link to="/inbox" style={styles.link}>Inbox 📨</Link>
            <Link to="/matches" onClick={() => setUnreadCount(0)} style={styles.badgeLink}>
              Matches 💖
              {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
            </Link>

            <Link to="/profile" style={styles.profileLink}>
              Hi, {user.firstName || 'Profile'} 👤
            </Link>

            <button onClick={handleLogout} className="swipe-btn" style={styles.logoutBtn}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Sign In</Link>
            <Link to="/signup" style={styles.joinBtn}>Join Us</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0.8rem 2rem', background: 'white', // Cleaner background for better readability
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 1000
  },
  logo: { fontSize: '1.5rem', fontWeight: 'bold', color: '#e91e63', textDecoration: 'none' },
  linksWrapper: { display: 'flex', alignItems: 'center', gap: '1.2rem' },
  link: { textDecoration: 'none', color: '#444', fontWeight: '500', fontSize: '0.95rem' },
  badgeLink: { textDecoration: 'none', color: '#444', fontWeight: '500', position: 'relative', fontSize: '0.95rem' },
  badge: {
    position: 'absolute', top: '-8px', right: '-15px', background: '#e91e63',
    color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '10px',
    fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
  },
  profileLink: { textDecoration: 'none', color: '#e91e63', fontWeight: 'bold' },
  logoutBtn: {
    background: '#333', color: 'white', border: 'none', padding: '7px 18px',
    borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600'
  },
  joinBtn: {
    textDecoration: 'none', background: '#e91e63', color: 'white',
    padding: '8px 22px', borderRadius: '25px', fontWeight: 'bold'
  }
};

export default Header;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../Config'; // Centralized Config

const Inbox: React.FC = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
  const myId = loggedInUser.id || loggedInUser._id;

  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/inbox/${myId}`);
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setConversations(data);
        } else {
          setConversations([]);
        }
      } catch (err) {
        console.error("Failed to load inbox", err);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    if (myId) fetchInbox();
  }, [myId]);

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <div className="loader"></div>
        <p style={{ marginTop: '10px', color: '#666' }}>Fetching your chats...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '650px' }}>
      <h2 style={styles.heading}>Your Messages 💬</h2>
      
      <div style={styles.inboxWrapper}>
        {conversations.length > 0 ? (
          conversations.map((chat) => (
            <Link 
              key={chat._id} 
              to={`/chat/${chat._id}`} 
              className="inbox-item"
              style={styles.chatLink}
            >
              <div style={styles.chatCard}>
                <img 
                  src={chat.image || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                  alt={chat.firstName} 
                  style={styles.avatar} 
                />
                
                <div style={{ flex: 1 }}>
                  <div style={styles.chatHeader}>
                    <h4 style={styles.userName}>{chat.firstName} {chat.lastName}</h4>
                    <span style={styles.date}>
                      {new Date(chat.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p style={styles.lastMessage}>
                    {chat.lastMessage || "No messages yet..."}
                  </p>
                </div>
                <div style={styles.arrow}>›</div>
              </div>
            </Link>
          ))
        ) : (
          <div style={styles.emptyState}>
            <div style={{ fontSize: '3rem' }}>🏜️</div>
            <h3>Your inbox is empty</h3>
            <p>Don't be shy! Start a conversation with one of your matches.</p>
            <Link to="/dashboard" className="swipe-btn" style={styles.matchBtn}>
              Find Matches
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  loaderContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' },
  heading: { color: '#e91e63', marginBottom: '25px', textAlign: 'center', fontWeight: '800' },
  inboxWrapper: { background: 'white', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', overflow: 'hidden' },
  chatLink: { textDecoration: 'none', color: 'inherit', display: 'block', transition: '0.2s' },
  chatCard: { 
    display: 'flex', alignItems: 'center', padding: '18px 20px', borderBottom: '1px solid #f5f5f5', 
    position: 'relative', cursor: 'pointer' 
  },
  avatar: { width: '55px', height: '55px', borderRadius: '50%', objectFit: 'cover', marginRight: '15px', border: '2px solid #fce7f3' },
  chatHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  userName: { margin: 0, color: '#333', fontSize: '1.05rem', fontWeight: '700' },
  date: { color: '#aaa', fontSize: '0.75rem' },
  lastMessage: { 
    margin: '4px 0 0', color: '#777', fontSize: '0.9rem', whiteSpace: 'nowrap', 
    overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' 
  },
  arrow: { color: '#ddd', fontSize: '1.5rem', marginLeft: '10px' },
  emptyState: { padding: '50px 20px', textAlign: 'center', color: '#666' },
  matchBtn: { 
    display: 'inline-block', marginTop: '20px', textDecoration: 'none', 
    padding: '10px 25px', borderRadius: '30px', color: 'white', fontWeight: 'bold' 
  }
};

export default Inbox;
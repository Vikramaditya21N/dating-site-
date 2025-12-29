import React, { useState, useEffect, useMemo } from 'react';
import TinderCard from 'react-tinder-card';
import MatchModal from './MatchModal'; // Ensure you renamed the file to MatchModal.tsx
import { API_BASE_URL } from '../Config'; // Ensure Config.ts is in src/ folder

// Define a simple type for our User data
interface User {
  _id: string;
  firstName: string;
  age: number;
  image: string;
  bio: string;
}

const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic Refs: This grows/shrinks automatically based on how many users we fetch
  const [childRefs, setChildRefs] = useState<React.RefObject<any>[]>([]);

  // Safe User Parsing
  const loggedInUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);
  
  const myId = loggedInUser.id || loggedInUser._id;

  // --- 1. Fetch Users & Initialize Refs ---
  useEffect(() => {
    const fetchUsers = async () => {
      if (!myId) return; // Don't fetch if not logged in

      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/auth/users?currentUserId=${myId}`);
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setUsers(data);
          // Create exactly one Ref for each user found
          setChildRefs(Array(data.length).fill(0).map(() => React.createRef()));
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [myId]);

  // --- 2. Handle Swipe (Manual or Button) ---
  const swiped = async (direction: string, user: User) => {
    const swipeDir = direction === 'right' ? 'right' : 'left';
    
    // Note: We leave the user in the 'users' array for a moment so the 
    // card remains visible while it flies off the screen.

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/wink`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ myId, targetUserId: user._id, direction: swipeDir }),
      });
      
      const data = await response.json();

      if (data.match && swipeDir === 'right') {
        setMatchedUser(user);
        setShowMatch(true);
        // We do NOT emit socket here anymore. The backend handles it securely.
      }
    } catch (err) {
      console.error("Swipe action error:", err);
    }
  };

  // --- 3. Handle Button Clicks ---
  const swipeAction = (dir: string) => {
    // Always swipe the card at the "top" of the stack (last index)
    const index = users.length - 1; 
    
    if (index >= 0 && childRefs[index]?.current) {
        // Trigger the swipe animation on the card
        // @ts-ignore (TinderCard refs have a swipe method)
        childRefs[index].current.swipe(dir);
        
        // Wait for animation to finish, then clean up state
        setTimeout(() => {
            setUsers(prev => prev.slice(0, -1));
            setChildRefs(prev => prev.slice(0, -1));
        }, 300);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Discover Matches 🌹</h2>

      <div className="card-container" style={styles.cardContainer}>
        {isLoading ? (
          <div style={styles.loaderCenter}>
            <div className="loader"></div>
          </div>
        ) : users.length > 0 ? (
          users.map((user, index) => (
            <TinderCard
              ref={childRefs[index]}
              className="swipe"
              key={user._id}
              onSwipe={(dir) => swiped(dir, user)}
              preventSwipe={['up', 'down']}
              swipeThreshold={60}
            >
              <div 
                style={{ 
                  ...styles.card, 
                  backgroundImage: `url(${user.image || 'https://via.placeholder.com/350x500'})` 
                }}
              >
                <div style={styles.cardInfo}>
                  <h3 style={{ margin: 0, fontSize: '1.6rem' }}>
                    {user.firstName}, {user.age}
                  </h3>
                  <p style={{ margin: '5px 0', opacity: 0.9, fontSize: '0.9rem' }}>
                    {user.bio || "Wink at me! 😉"}
                  </p>
                </div>
              </div>
            </TinderCard>
          ))
        ) : (
          <div style={styles.emptyState}>
            <div style={{ fontSize: '3rem' }}>😴</div>
            <h3>No more profiles!</h3>
            <p style={{ color: '#888' }}>Check back later for new people.</p>
          </div>
        )}
      </div>

      <div style={styles.buttonContainer}>
        <button 
          onClick={() => swipeAction('left')} 
          className="swipe-btn" 
          style={{ ...styles.iconBtn, color: '#ff4444', border: '2px solid #ff4444' }}
        >
          ✖
        </button>
        <button 
          onClick={() => swipeAction('right')} 
          className="swipe-btn" 
          style={{ ...styles.iconBtn, color: '#4CAF50', border: '2px solid #4CAF50' }}
        >
          ❤️
        </button>
      </div>

      <MatchModal 
        isOpen={showMatch} 
        onClose={() => setShowMatch(false)} 
        matchedUser={matchedUser} 
      />
    </div>
  );
};

// Styles kept clean and consistent
const styles: Record<string, React.CSSProperties> = {
  container: { 
    display: 'flex', flexDirection: 'column', alignItems: 'center', 
    justifyContent: 'center', height: '85vh', background: '#f8f9fa', 
    overflow: 'hidden', touchAction: 'none' 
  },
  heading: { color: '#e91e63', marginBottom: '20px', zIndex: 100, fontWeight: '800' },
  cardContainer: { 
    position: 'relative', width: '90vw', maxWidth: '360px', 
    height: '520px', display: 'flex', justifyContent: 'center', 
    alignItems: 'center' 
  },
  card: { 
    position: 'absolute', backgroundColor: '#fff', width: '100%', 
    height: '500px', borderRadius: '25px', backgroundSize: 'cover', 
    backgroundPosition: 'center', boxShadow: '0px 10px 25px rgba(0,0,0,0.1)', 
    cursor: 'grab' 
  },
  cardInfo: { 
    position: 'absolute', bottom: 0, width: '100%', padding: '30px 20px', 
    background: 'linear-gradient(to top, rgba(0,0,0,0.95), transparent)', 
    borderRadius: '0 0 25px 25px', color: 'white', boxSizing: 'border-box' 
  },
  emptyState: { 
    textAlign: 'center', padding: '60px 20px', color: '#333', 
    background: 'white', borderRadius: '25px', 
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)', width: '350px' 
  },
  loaderCenter: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
  buttonContainer: { marginTop: '20px', display: 'flex', gap: '40px', zIndex: 100 },
  iconBtn: { 
    width: '65px', height: '65px', borderRadius: '50%', background: 'white', 
    boxShadow: '0 6px 15px rgba(0,0,0,0.1)', cursor: 'pointer', 
    fontSize: '1.6rem', display: 'flex', justifyContent: 'center', 
    alignItems: 'center', transition: '0.1s transform' 
  }
};

export default Dashboard;
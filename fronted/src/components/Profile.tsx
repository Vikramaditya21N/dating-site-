import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../Config'; // Centralized Config

const Profile: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form States
  const [form, setForm] = useState({
    bio: "",
    interests: "",
    image: "",
    age: ""
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUserData(parsed);
      setForm({
        bio: parsed.bio || "",
        interests: parsed.interests || "",
        image: parsed.image || "",
        age: parsed.age || ""
      });
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: userData.id || userData._id, 
          ...form 
        }),
      });
      
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUserData(data.user);
        setIsEditing(false);
        toast.success("Profile Updated Successfully! 🌹");
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error connecting to server");
    } finally {
      setIsLoading(false);
    }
  };

  if (!userData) {
    return (
      <div style={styles.loaderContainer}>
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '550px' }}>
      <div style={styles.card}>
        
        {/* --- PROFILE PICTURE --- */}
        <div style={styles.avatarWrapper}>
          <img 
            src={form.image || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
            alt="Profile" 
            style={styles.avatar} 
          />
        </div>

        <h2 style={styles.userName}>
          {userData.firstName} {userData.lastName}
        </h2>
        
        {isEditing ? (
          /* --- EDIT MODE --- */
          <div style={styles.formContainer}>
            <div style={styles.inputBox}>
              <label style={styles.label}>Profile Image URL</label>
              <input name="image" value={form.image} onChange={handleInputChange} placeholder="Paste image link..." style={styles.input} />
            </div>

            <div style={styles.inputBox}>
              <label style={styles.label}>Age</label>
              <input name="age" type="number" value={form.age} onChange={handleInputChange} style={styles.input} />
            </div>

            <div style={styles.inputBox}>
              <label style={styles.label}>Bio</label>
              <textarea name="bio" value={form.bio} onChange={handleInputChange} rows={3} style={styles.textarea} />
            </div>

            <div style={styles.inputBox}>
              <label style={styles.label}>Interests (comma separated)</label>
              <input name="interests" value={form.interests} onChange={handleInputChange} placeholder="Reading, Travel, Music" style={styles.input} />
            </div>

            <div style={styles.btnGroup}>
              <button onClick={() => setIsEditing(false)} className="swipe-btn" style={styles.cancelBtn}>Cancel</button>
              <button onClick={handleSave} disabled={isLoading} className="swipe-btn" style={styles.saveBtn}>
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        ) : (
          /* --- VIEW MODE --- */
          <div style={styles.viewContainer}>
            <div style={styles.infoRow}>
               <span><strong>Age:</strong> {userData.age || 'Not set'}</span>
               <span><strong>Email:</strong> {userData.email}</span>
            </div>
            
            <div style={styles.section}>
              <strong>About Me</strong>
              <p style={styles.bioText}>{userData.bio || "Write something romantic about yourself..."}</p>
            </div>

            <div style={styles.section}>
              <strong>Interests</strong>
              <div style={styles.tagWrapper}>
                {userData.interests ? (
                  userData.interests.split(',').map((tag: string, i: number) => (
                    <span key={i} style={styles.tag}>{tag.trim()}</span>
                  ))
                ) : <span style={{color: '#999', fontSize: '0.9rem'}}>No interests added.</span>}
              </div>
            </div>

            <button onClick={() => setIsEditing(true)} className="swipe-btn" style={styles.editBtn}>
              Edit Profile ✏️
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  loaderContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' },
  card: { padding: '2.5rem', borderRadius: '25px', background: 'white', boxShadow: '0 15px 35px rgba(0,0,0,0.08)', textAlign: 'center' },
  avatarWrapper: { marginBottom: '1.5rem' },
  avatar: { width: '130px', height: '130px', borderRadius: '50%', objectFit: 'cover', border: '5px solid #fce7f3', boxShadow: '0 5px 15px rgba(233, 30, 99, 0.2)' },
  userName: { color: '#333', fontSize: '1.8rem', fontWeight: '800' },
  formContainer: { textAlign: 'left', marginTop: '20px' },
  inputBox: { marginBottom: '15px' },
  label: { fontWeight: '700', fontSize: '0.85rem', color: '#e91e63', marginBottom: '5px', display: 'block' },
  input: { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #eee', boxSizing: 'border-box', background: '#fdfdfd' },
  textarea: { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #eee', boxSizing: 'border-box', resize: 'none', background: '#fdfdfd' },
  btnGroup: { display: 'flex', gap: '15px', marginTop: '25px' },
  cancelBtn: { flex: 1, padding: '12px', background: '#f5f5f5', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' },
  saveBtn: { flex: 1, padding: '12px', background: '#e91e63', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' },
  viewContainer: { textAlign: 'left', marginTop: '25px' },
  infoRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: '#666', marginBottom: '20px' },
  section: { marginBottom: '20px' },
  bioText: { background: '#fffafa', padding: '15px', borderRadius: '15px', color: '#555', border: '1px solid #fce7f3', marginTop: '8px', lineHeight: '1.5' },
  tagWrapper: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' },
  tag: { background: '#ffe4e1', color: '#e91e63', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' },
  editBtn: { width: '100%', marginTop: '20px', padding: '14px', background: '#333', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' }
};

export default Profile;
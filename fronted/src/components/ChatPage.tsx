import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { socket } from '../socket';
import { API_BASE_URL } from '../Config'; // Using centralized config

const ChatPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
  const myId = loggedInUser.id || loggedInUser._id;
  const myName = loggedInUser.firstName || "Someone";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom whenever messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket.connected) socket.connect();
    
    // Join private room
    socket.emit('join_room', myId);

    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/messages/${myId}/${userId}`);
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();

    socket.on('receive_message', (data) => {
      if (data.sender === userId) {
        setMessages((prev) => [...prev, data]);
      }
    });

    return () => {
      socket.off('receive_message');
    };
  }, [myId, userId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      sender: myId,
      receiver: userId,
      text: newMessage,
      senderName: myName,
      createdAt: new Date()
    };

    // Real-time emit
    socket.emit('send_message', messageData);
    
    // Optimistic UI update (shows message immediately)
    setMessages((prev) => [...prev, messageData]);

    try {
      await fetch(`${API_BASE_URL}/api/auth/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: myId,
          receiver: userId,
          text: newMessage
        }),
      });
    } catch (err) {
      console.error("Message not saved to DB", err);
    }

    setNewMessage("");
  };

  return (
    <div style={styles.chatWrapper}>
      {/* Header */}
      <div style={styles.header}>
        Chatting with Match 💖
      </div>
      
      {/* Message Area */}
      <div style={styles.messageArea}>
        {loading ? (
          <div style={styles.loaderCenter}><div className="loader"></div></div>
        ) : messages.length === 0 ? (
          <p style={styles.emptyText}>Start the conversation with a "Wink"! 😉</p>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.sender === myId;
            return (
              <div key={i} style={{
                ...styles.bubble,
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                backgroundColor: isMe ? '#e91e63' : '#eee',
                color: isMe ? 'white' : 'black',
                borderRadius: isMe ? '15px 15px 0 15px' : '15px 15px 15px 0',
              }}>
                {msg.text}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={sendMessage} style={styles.form}>
        <input 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)} 
          placeholder="Type your message..."
          style={styles.input}
        />
        <button type="submit" style={styles.sendBtn}>
          Send
        </button>
      </form>
    </div>
  );
};

// Styles moved out of render for cleaner code
const styles: Record<string, React.CSSProperties> = {
  chatWrapper: {
    maxWidth: '500px', margin: '20px auto', height: '80vh', 
    display: 'flex', flexDirection: 'column', border: '1px solid #ddd', 
    borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    background: 'white'
  },
  header: { padding: '15px', background: '#e91e63', color: 'white', fontWeight: 'bold', textAlign: 'center' },
  messageArea: { flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', background: '#fdfdfd' },
  bubble: { padding: '10px 14px', margin: '5px 0', maxWidth: '75%', fontSize: '0.95rem', transition: 'all 0.2s' },
  loaderCenter: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: '20px', fontStyle: 'italic' },
  form: { display: 'flex', padding: '15px', background: 'white', borderTop: '1px solid #eee' },
  input: { flex: 1, padding: '12px 18px', borderRadius: '25px', border: '1px solid #ddd', outline: 'none', fontSize: '1rem' },
  sendBtn: { marginLeft: '10px', padding: '10px 20px', backgroundColor: '#e91e63', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' }
};

export default ChatPage;
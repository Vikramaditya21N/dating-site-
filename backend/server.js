require('dotenv').config(); // MUST BE LINE 1
const express = require('express');
// ... rest of your imports
// const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

const app = express();

// 1. MIDDLEWARE
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());

// 2. ROUTES
app.use('/api/auth', authRoutes);

// 3. DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB! 🌹"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// 4. SOCKET.IO SETUP
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Helper to make 'io' accessible in other files (optional but useful)
app.set('socketio', io);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins their own unique room named after their UserID
  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} is ready to receive messages/notifications`);
  });

  // Handle Chat Messages
  socket.on('send_message', (data) => {
    // data should contain: { sender, receiver, text, senderName }
    
    // 1. Send actual message to the receiver
    io.to(data.receiver).emit('receive_message', data);

    // 2. Send a "New Message" notification to the receiver
    io.to(data.receiver).emit('new_notification', {
      type: 'MESSAGE',
      from: data.senderName || 'A match',
      text: data.text
    });
  });

  // Handle Real-time Match Notification (Triggered when a match is detected)
  socket.on('send_match_notification', (data) => {
     // data: { myId, targetUserId, myName }
     io.to(data.targetUserId).emit('new_notification', {
       type: 'MATCH',
       title: "It's a Match! 💖",
       text: `${data.myName} liked you back!`,
     });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// 5. START SERVER
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
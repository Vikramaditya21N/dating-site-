require('dotenv').config(); // MUST BE LINE 1
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');

const app = express();

// 1. MIDDLEWARE
app.use(cors({
    // Ensure these URLs are exact (no trailing slashes)
    origin: ["http://localhost:5173", "https://dating-site-jdhw65jby-vikramaditya21ns-projects.vercel.app"],
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
    origin: ["http://localhost:5173", "https://dating-site-jdhw65jby-vikramaditya21ns-projects.vercel.app"],
    methods: ["GET", "POST"]
  }
});

app.set('socketio', io);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  socket.on('send_message', (data) => {
    io.to(data.receiver).emit('receive_message', data);
    io.to(data.receiver).emit('new_notification', {
      type: 'MESSAGE',
      from: data.senderName || 'A match',
      text: data.text
    });
  });

  socket.on('send_match_notification', (data) => {
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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
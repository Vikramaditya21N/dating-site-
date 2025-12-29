require('dotenv').config(); 
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Use an array for origins to keep it clean
const allowedOrigins = [
    "http://localhost:5173", 
    "https://dating-site-topaz.vercel.app" // Your live production link
];

// 1. MIDDLEWARE
app.use(cors({
    origin: allowedOrigins,
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
    origin: allowedOrigins,
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

// 5. START SERVER
const PORT = process.env.PORT || 5000;
// Note: We use 0.0.0.0 to ensure Render can bind to the port correctly
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} 🚀`);
});
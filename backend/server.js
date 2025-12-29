require('dotenv').config(); 
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');

const app = express();

// 1. DYNAMIC CORS CONFIGURATION
const allowedOrigins = [
    "http://localhost:5173", 
    "https://dating-site-topaz.vercel.app"
];

app.use(cors({
    origin: function (origin, callback) {
        // Log the origin to Render dashboard so we can see what is being blocked
        console.log("Incoming request from origin:", origin);

        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);

        // Check if origin is in our list OR is any vercel.app subdomain
        const isAllowed = allowedOrigins.includes(origin) || origin.endsWith(".vercel.app");

        if (isAllowed) {
            callback(null, true);
        } else {
            console.error("CORS Blocked for origin:", origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
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
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST"],
    credentials: true
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
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} 🚀`);
});
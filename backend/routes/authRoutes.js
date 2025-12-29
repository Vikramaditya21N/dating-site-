const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// --- AUTHENTICATION ---
// URL: http://localhost:5000/api/auth/signup
router.post('/signup', authController.signup);

// URL: http://localhost:5000/api/auth/login
router.post('/login', authController.login); 

// --- DISCOVERY & MATCHING ---
// Get all users for the dashboard
router.get('/users', authController.getAllUsers);

// Handle the "Wink" (Like) action
router.post('/wink', authController.handleWink);

// Get the list of matched users
router.get('/matches', authController.getMatches);

// --- CHAT FUNCTIONALITY (New) ---
// Save a new message to the database
router.post('/messages', authController.sendMessage);

// Get chat history between two specific users
router.get('/messages/:myId/:theirId', authController.getMessages);

// --- PROFILE UPDATES (New) ---
// Update bio, interests, image, etc.
router.put('/profile', authController.updateProfile);


router.get('/inbox/:userId', authController.getInbox);

module.exports = router;
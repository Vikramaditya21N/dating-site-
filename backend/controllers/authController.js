const User = require('../models/User'); // Ensure file is named User.js (Capital U)
const Message = require('../models/Message'); // Ensure file is named Message.js (Capital M)
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose'); // Added for ObjectId conversion

// --- Helper for consistent User Data Return ---
const sanitizeUser = (user) => ({
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    age: user.age,
    gender: user.gender,
    bio: user.bio,
    interests: user.interests,
    image: user.image
});

// --- 1. SIGNUP ---
exports.signup = async (req, res) => {
  try {
    console.log("Signup Data Received:", req.body); 

    const { email, password, ...rest } = req.body;

    // Safety Check: Prevent crash if email/password are missing
    if (!email || !password) {
      return res.status(400).json({ message: "Email and Password are required" });
    }

    const lowerEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: lowerEmail });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({ 
      ...rest, 
      email: lowerEmail, 
      password: hashedPassword 
    });

    await newUser.save();
    res.status(201).json({ message: "Account created! 🌹" });
  } catch (err) {
    console.error("Signup Error Details:", err);
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: err.message }); // Sends "Age is required" etc.
    }
    res.status(500).json({ message: "Error creating account" });
  }
};

// --- 2. LOGIN ---
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Safety check
    if (!email || !password) return res.status(400).json({ message: "Please provide email and password" });

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password'); // Explicitly select password
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials. 🌹" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
};

// --- 3. GET ALL USERS (Discovery) ---
exports.getAllUsers = async (req, res) => {
  try {
    const { currentUserId } = req.query;
    let query = {};

    if (currentUserId) {
      const me = await User.findById(currentUserId).select('likes');
      if (me) {
        // Exclude yourself AND people you already liked
        query._id = { $nin: [currentUserId, ...(me.likes || [])] };
      }
    }

    const users = await User.find(query).select('-password -likes -matches').limit(30);
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// --- 4. HANDLE WINK (Match Logic) ---
exports.handleWink = async (req, res) => {
  try {
    const { myId, targetUserId } = req.body;

    // Atomic update to prevent duplicates
    const me = await User.findByIdAndUpdate(myId, { $addToSet: { likes: targetUserId } }, { new: true });
    const target = await User.findById(targetUserId);

    if (!target) return res.status(404).json({ message: "User not found" });

    // Check for Match
    const isMatch = target.likes.includes(myId);
    if (isMatch) {
      await User.findByIdAndUpdate(myId, { $addToSet: { matches: targetUserId } });
      await User.findByIdAndUpdate(targetUserId, { $addToSet: { matches: myId } });

      const io = req.app.get('socketio');
      if (io) {
        io.to(targetUserId).emit('new_notification', {
          type: 'MATCH',
          from: me.firstName,
          fromId: me._id,
          text: `It's a Match! 💖 ${me.firstName} liked you back!`
        });
      }
      return res.status(200).json({ match: true, message: "It's a Match! 💖", matchedUser: target });
    }
    res.status(200).json({ match: false, message: "Wink sent! 😉" });
  } catch (err) {
    console.error("Wink Error:", err);
    res.status(500).json({ message: "Wink processing failed" });
  }
};

// --- 5. GET INBOX (Fixed Syntax Error) ---
exports.getInbox = async (req, res) => {
  try {
    // FIX: Correct way to create ObjectId
    const userId = new mongoose.Types.ObjectId(req.params.userId);

    const inbox = await Message.aggregate([
      { $match: { $or: [{ sender: userId }, { receiver: userId }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", userId] },
              "$receiver",
              "$sender"
            ]
          },
          lastMessage: { $first: "$text" },
          createdAt: { $first: "$createdAt" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          _id: 1,
          lastMessage: 1,
          createdAt: 1,
          firstName: "$userDetails.firstName",
          lastName: "$userDetails.lastName",
          image: "$userDetails.image"
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    res.status(200).json(inbox);
  } catch (err) {
    console.error("Inbox Error:", err);
    res.status(500).json({ message: "Failed to load inbox" });
  }
};

// --- 6. OTHER ROUTES ---
exports.getMatches = async (req, res) => {
  try {
    const user = await User.findById(req.query.userId).populate('matches', 'firstName lastName image bio age');
    res.json(user ? user.matches : []);
  } catch (err) { res.status(500).json({message: "Error"}); }
};

exports.sendMessage = async (req, res) => {
  try {
    const newMessage = await new Message(req.body).save();
    res.status(201).json(newMessage);
  } catch (err) { res.status(500).json({message: "Error sending"}); }
};

exports.getMessages = async (req, res) => {
  try {
    const { myId, theirId } = req.params;
    const messages = await Message.find({
      $or: [{ sender: myId, receiver: theirId }, { sender: theirId, receiver: myId }]
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) { res.status(500).json({message: "Error fetching"}); }
};

exports.updateProfile = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.body.userId, req.body, { new: true });
    res.json({ message: "Updated!", user: sanitizeUser(updated) });
  } catch (err) { res.status(500).json({message: "Update failed"}); }
};
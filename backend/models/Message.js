const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  receiver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  text: { 
    type: String, 
    required: true,
    trim: true 
  }
}, { 
  timestamps: true 
});

// Optimization for fast chat history loading
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
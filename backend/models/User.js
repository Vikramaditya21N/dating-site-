const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  bio: { type: String, default: "" },
  image: { type: String, default: "" },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
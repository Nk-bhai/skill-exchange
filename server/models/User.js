const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  skillsToTeach: [{ type: String }],
  skillsToLearn: [{ type: String }],
  bio: String,
  profileImage: { type: String, default: '/profile-placeholder.png' },
  location: { type: String, default: 'Not specified' },
  experienceLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  interests: [{ type: String }],
  ratings: [{ userId: mongoose.Schema.Types.ObjectId, rating: Number }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
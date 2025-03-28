const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/profile', auth, async (req, res) => {
  const { skillsToTeach, skillsToLearn, bio, profileImage, location, experienceLevel, interests } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.skillsToTeach = skillsToTeach || user.skillsToTeach;
    user.skillsToLearn = skillsToLearn || user.skillsToLearn;
    user.bio = bio || user.bio;
    user.profileImage = profileImage || user.profileImage;
    user.location = location || user.location;
    user.experienceLevel = experienceLevel || user.experienceLevel;
    user.interests = interests || user.interests;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
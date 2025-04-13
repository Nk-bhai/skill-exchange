const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Skill = require('../models/Skill');
const { check, validationResult } = require('express-validator');

// Get user profile by ID
router.get('/profile/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ msg: 'Error fetching profile', error: error.message });
  }
});

// Update user profile
router.put(
  '/profile',
  [
    auth,
    check('username', 'Username is required').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      username,
      bio,
      location,
      experienceLevel,
      interests,
      skillsToTeach,
      skillsToLearn,
      skillsToTeachCategory,
    } = req.body;

    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      // Update user fields
      user.username = username || user.username;
      user.bio = bio || user.bio;
      user.location = location || user.location;
      user.experienceLevel = experienceLevel || user.experienceLevel;
      user.interests = interests || user.interests;
      user.skillsToTeach = skillsToTeach || user.skillsToTeach;
      user.skillsToLearn = skillsToLearn || user.skillsToLearn;

      // Sync skillsToTeach with Skill collection
      const currentSkills = await Skill.find({ userId: user._id }).select('name');
      const currentSkillNames = currentSkills.map((skill) => skill.name);
      const newSkillNames = skillsToTeach || [];

      // Remove skills no longer in skillsToTeach
      const skillsToRemove = currentSkillNames.filter((name) => !newSkillNames.includes(name));
      if (skillsToRemove.length) {
        await Skill.deleteMany({ userId: user._id, name: { $in: skillsToRemove } });
      }

      // Add new skills to Skill collection
      const skillsToAdd = newSkillNames.filter((name) => !currentSkillNames.includes(name));
      if (skillsToAdd.length) {
        const newSkills = skillsToAdd.map((name) => ({
          name,
          category: skillsToTeachCategory || 'General',
          userId: user._id,
          description: `Learn ${name} with ${user.username}`,
        }));
        await Skill.insertMany(newSkills);
      }

      await user.save();
      const updatedUser = await User.findById(user._id).select('-password');
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ msg: 'Error updating profile', error: error.message });
    }
  }
);

module.exports = router;
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Skill = require('../models/Skill');

router.get('/', auth, async (req, res) => {
  try {
    const user = await require('../models/User').findById(req.user.id);
    const matches = await Skill.find({ name: { $in: user.skillsToLearn } })
      .populate('userId', 'username profileImage');
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
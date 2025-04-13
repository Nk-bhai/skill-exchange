const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Skill = require('../models/Skill');
const { check, validationResult } = require('express-validator');

// Get all skills
router.get('/', async (req, res) => {
  try {
    const skills = await Skill.find()
      .populate('userId', 'username profileImage')
      .sort({ createdAt: -1 }); // Newest first
    res.json(skills);
  } catch (error) {
    res.status(500).json({ msg: 'Error fetching skills', error: error.message });
  }
});

// Create a new skill
router.post(
  '/',
  [
    auth,
    check('name', 'Skill name is required').notEmpty(),
    check('category', 'Category is required').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, category, description } = req.body;

    try {
      // Check for duplicate skill by user
      const existingSkill = await Skill.findOne({ name, userId: req.user.id });
      if (existingSkill) {
        return res.status(400).json({ msg: 'You already added this skill' });
      }

      const skill = new Skill({
        name,
        category,
        userId: req.user.id,
        description,
      });
      await skill.save();
      const populatedSkill = await Skill.findById(skill._id).populate('userId', 'username profileImage');
      res.status(201).json(populatedSkill);
    } catch (error) {
      res.status(500).json({ msg: 'Error creating skill', error: error.message });
    }
  }
);

module.exports = router;
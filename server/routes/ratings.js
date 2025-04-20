const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Rating = require('../models/Rating');
const Session = require('../models/Session');
const User = require('../models/User');

router.post(
  '/',
  [
    auth,
    check('sessionId', 'Session ID required').notEmpty(),
    check('rating', 'Rating must be between 1 and 5').isInt({ min: 1, max: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ msg: 'Validation failed', errors: errors.array() });
    }

    const { sessionId, rating, comment } = req.body;

    try {
      const session = await Session.findById(sessionId).populate('teacherId learnerId');
      if (!session) return res.status(404).json({ msg: 'Session not found' });
      if (session.learnerId._id.toString() !== req.user.id) {
        return res.status(403).json({ msg: 'Not authorized to rate this session' });
      }
      if (session.ratedByLearner) {
        return res.status(400).json({ msg: 'Session already rated' });
      }
      if (session.status !== 'completed') {
        return res.status(400).json({ msg: 'Session not completed' });
      }

      const newRating = new Rating({
        sessionId,
        teacherId: session.teacherId._id,
        learnerId: req.user.id,
        rating,
        comment,
      });

      await newRating.save();

      session.ratedByLearner = true;
      await session.save();

      // Update teacher's avgRating
      const ratings = await Rating.find({ teacherId: session.teacherId._id });
      const avgRating =
        ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length || 0;
      await User.findByIdAndUpdate(session.teacherId._id, { avgRating });

      res.json({ msg: 'Rating submitted' });
    } catch (error) {
      console.error('Rating error:', error.message);
      res.status(500).json({ msg: 'Server error' });
    }
  }
);

// Get received ratings for the logged-in user
router.get('/received', auth, async (req, res) => {
  try {
    const ratings = await Rating.find({ teacherId: req.user.id })
      .populate('sessionId', 'skillId date')
      .populate('learnerId', 'username')
      .populate('skillId', 'name');
    res.json(ratings);
  } catch (error) {
    console.error('Get received ratings error:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
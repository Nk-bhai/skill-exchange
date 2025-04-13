const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Session = require('../models/Session');
const { check, validationResult } = require('express-validator');

// Schedule a new session
router.post(
  '/schedule',
  [
    auth,
    check('teacherId', 'Teacher ID is required').isMongoId(),
    check('skillId', 'Skill ID is required').isMongoId(),
    check('date', 'Date is required').isISO8601().toDate(),
    check('duration', 'Duration must be 30, 60, or 90 minutes').isIn([30, 60, 90]),
    check('type', 'Type must be virtual or in-person').isIn(['virtual', 'in-person']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { teacherId, skillId, date, duration, type } = req.body;

    try {
      // Validate future date
      if (new Date(date) <= new Date()) {
        return res.status(400).json({ msg: 'Date must be in the future' });
      }

      // Check for conflicting sessions
      const existingSession = await Session.findOne({
        teacherId,
        date: { $gte: new Date(date), $lte: new Date(new Date(date).getTime() + duration * 60000) },
        status: { $in: ['pending', 'confirmed'] },
      });
      if (existingSession) {
        return res.status(400).json({ msg: 'Teacher is booked for this time slot' });
      }

      const session = new Session({
        teacherId,
        learnerId: req.user.id,
        skillId,
        date,
        duration,
        type,
      });
      await session.save();
      // TODO: Send notification to teacher (e.g., via email)
      res.json(session);
    } catch (error) {
      res.status(500).json({ msg: 'Server error', error: error.message });
    }
  }
);

// Get user's sessions
router.get('/my-sessions', auth, async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [{ teacherId: req.user.id }, { learnerId: req.user.id }],
    })
      .populate('teacherId', 'username profileImage')
      .populate('learnerId', 'username profileImage')
      .populate('skillId', 'name')
      .sort({ date: 1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Cancel a session
router.delete('/cancel/:id', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ msg: 'Session not found' });
    }
    if (
      session.learnerId.toString() !== req.user.id &&
      session.teacherId.toString() !== req.user.id
    ) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    if (session.status === 'cancelled') {
      return res.status(400).json({ msg: 'Session already cancelled' });
    }
    if (session.status === 'completed') {
      return res.status(400).json({ msg: 'Cannot cancel completed session' });
    }

    session.status = 'cancelled';
    await session.save();
    // TODO: Send notification to other party (e.g., via email)
    res.json({ msg: 'Session cancelled' });
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Reschedule a session
router.put(
  '/reschedule/:id',
  [
    auth,
    check('date', 'Date is required').isISO8601().toDate().optional(),
    check('duration', 'Duration must be 30, 60, or 90 minutes').isIn([30, 60, 90]).optional(),
    check('type', 'Type must be virtual or in-person').isIn(['virtual', 'in-person']).optional(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { date, duration, type } = req.body;

    try {
      const session = await Session.findById(req.params.id);
      if (!session) {
        return res.status(404).json({ msg: 'Session not found' });
      }
      if (session.learnerId.toString() !== req.user.id) {
        return res.status(403).json({ msg: 'Only learner can reschedule' });
      }
      if (session.status === 'cancelled' || session.status === 'completed') {
        return res.status(400).json({ msg: 'Cannot reschedule cancelled or completed session' });
      }

      // Validate future date if provided
      if (date && new Date(date) <= new Date()) {
        return res.status(400).json({ msg: 'Date must be in the future' });
      }

      // Check teacher availability if date changes
      if (date) {
        const existingSession = await Session.findOne({
          teacherId: session.teacherId,
          date: { $gte: new Date(date), $lte: new Date(new Date(date).getTime() + (duration || session.duration) * 60000) },
          status: { $in: ['pending', 'confirmed'] },
          _id: { $ne: session._id },
        });
        if (existingSession) {
          return res.status(400).json({ msg: 'Teacher is booked for this time slot' });
        }
      }

      session.date = date || session.date;
      session.duration = duration || session.duration;
      session.type = type || session.type;
      session.status = 'pending';
      await session.save();
      // TODO: Send notification to teacher (e.g., via email)
      res.json({ msg: 'Session rescheduled', session });
    } catch (error) {
      res.status(500).json({ msg: 'Server error', error: error.message });
    }
  }
);

// Confirm a session (teacher only)
router.put('/confirm/:id', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ msg: 'Session not found' });
    }
    if (session.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Only teacher can confirm' });
    }
    if (session.status !== 'pending') {
      return res.status(400).json({ msg: 'Session cannot be confirmed' });
    }

    session.status = 'confirmed';
    await session.save();
    // TODO: Send notification to learner (e.g., via email)
    res.json({ msg: 'Session confirmed', session });
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

module.exports = router;
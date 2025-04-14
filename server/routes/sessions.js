const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Session = require('../models/Session');
const { check, validationResult } = require('express-validator');

// Generate random string for Jitsi URL security
const generateRandomString = (length) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

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
      if (new Date(date) <= new Date()) {
        return res.status(400).json({ msg: 'Date must be in the future' });
      }

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
    if (session.status === 'cancelled' || session.status === 'rejected') {
      return res.status(400).json({ msg: 'Session already cancelled or rejected' });
    }
    if (session.status === 'completed') {
      return res.status(400).json({ msg: 'Cannot cancel completed session' });
    }

    session.status = 'cancelled';
    await session.save();
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
      if (session.status === 'cancelled' || session.status === 'completed' || session.status === 'rejected') {
        return res.status(400).json({ msg: 'Cannot reschedule cancelled, completed, or rejected session' });
      }

      if (date && new Date(date) <= new Date()) {
        return res.status(400).json({ msg: 'Date must be in the future' });
      }

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
      session.meetingLink = null; // Reset meeting link on reschedule
      await session.save();
      res.json({ msg: 'Session rescheduled', session });
    } catch (error) {
      res.status(500).json({ msg: 'Server error', error: error.message });
    }
  }
);

// Confirm or reject a session (teacher only)
router.put(
  '/confirm/:id',
  [
    auth,
    check('action', 'Action must be confirm or reject').isIn(['confirm', 'reject']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { action } = req.body;

    try {
      const session = await Session.findById(req.params.id);
      if (!session) {
        return res.status(404).json({ msg: 'Session not found' });
      }
      if (session.teacherId.toString() !== req.user.id) {
        return res.status(403).json({ msg: 'Only teacher can confirm or reject' });
      }
      if (session.status !== 'pending') {
        return res.status(400).json({ msg: 'Session cannot be confirmed or rejected' });
      }

      session.status = action === 'confirm' ? 'confirmed' : 'rejected';
      if (action === 'confirm') {
        // Generate Jitsi Meet URL
        const randomSuffix = generateRandomString(6);
        session.meetingLink = `https://meet.jit.si/SkillExchange_${session._id}_${randomSuffix}`;
      }
      await session.save();
      res.json({ msg: `Session ${action}ed`, session });
    } catch (error) {
      res.status(500).json({ msg: 'Server error', error: error.message });
    }
  }
);

// Complete a session
router.put('/complete/:id', auth, async (req, res) => {
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
    if (session.status !== 'confirmed') {
      return res.status(400).json({ msg: 'Session cannot be completed' });
    }

    session.status = 'completed';
    await session.save();
    res.json({ msg: 'Session completed', session });
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Session = require('../models/Session');

router.post('/schedule', auth, async (req, res) => {
  const { teacherId, skillId, date, duration, type } = req.body;
  try {
    const existingSession = await Session.findOne({
      teacherId,
      date,
      status: { $in: ['pending', 'confirmed'] }
    });
    if (existingSession) return res.status(400).json({ msg: 'Time slot already booked' });

    const session = new Session({
      teacherId,
      learnerId: req.user.id,
      skillId,
      date,
      duration,
      type
    });
    await session.save();
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/my-sessions', auth, async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [{ teacherId: req.user.id }, { learnerId: req.user.id }]
    })
      .populate('teacherId', 'username profileImage')
      .populate('learnerId', 'username profileImage')
      .populate('skillId', 'name');
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/cancel/:id', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ msg: 'Session not found' });
    if (session.learnerId.toString() !== req.user.id && session.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    session.status = 'cancelled'; // Incomplete: Add notification logic
    await session.save();
    res.json({ msg: 'Session cancelled (incomplete)' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/reschedule/:id', auth, async (req, res) => {
  const { date, duration, type } = req.body;
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ msg: 'Session not found' });
    if (session.learnerId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Only learner can reschedule' });
    }
    session.date = date || session.date;
    session.duration = duration || session.duration;
    session.type = type || session.type;
    session.status = 'pending'; // Incomplete: Add availability check
    await session.save();
    res.json({ msg: 'Session rescheduled (incomplete)', session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import ProfileImg from '../assets/profile-placeholder.png';
import '../App.css';

function Dashboard({ user }) {
  const [sessions, setSessions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [stats, setStats] = useState({ totalSessions: 0, completedSessions: 0, rating: 0 });
  const [loading, setLoading] = useState(true);
  const [rescheduleSessionId, setRescheduleSessionId] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({ date: new Date(), duration: 60, type: 'virtual' });
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [sessionsRes, matchesRes] = await Promise.all([
        axios.get('/api/sessions/my-sessions', { headers: { 'x-auth-token': localStorage.getItem('token') } }),
        axios.get('/api/matches', { headers: { 'x-auth-token': localStorage.getItem('token') } }),
      ]);
      setSessions(sessionsRes.data);
      setMatches(matchesRes.data);
      setStats({
        totalSessions: sessionsRes.data.length,
        completedSessions: sessionsRes.data.filter((s) => s.status === 'completed').length,
        rating: user.ratings?.length
          ? (user.ratings.reduce((sum, r) => sum + r.rating, 0) / user.ratings.length).toFixed(1)
          : 0,
      });
      setLoading(false);
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Error fetching dashboard data');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return navigate('/auth');
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  const handleCancelSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to cancel this session?')) return;

    try {
      const res = await axios.delete(`/api/sessions/cancel/${sessionId}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') },
      });
      toast.success(res.data.msg);
      setSessions(sessions.map((s) => (s._id === sessionId ? { ...s, status: 'cancelled' } : s)));
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Error cancelling session');
    }
  };

  const handleRescheduleSession = async (sessionId) => {
    if (!rescheduleSessionId) {
      setRescheduleSessionId(sessionId);
      return;
    }

    try {
      const res = await axios.put(
        `/api/sessions/reschedule/${sessionId}`,
        rescheduleData,
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      toast.success(res.data.msg);
      setSessions(sessions.map((s) => (s._id === sessionId ? res.data.session : s)));
      setRescheduleSessionId(null);
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Error rescheduling session');
    }
  };

  const handleSessionAction = async (sessionId, action) => {
    try {
      const res = await axios.put(
        `/api/sessions/confirm/${sessionId}`,
        { action },
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      toast.success(res.data.msg);
      setSessions(sessions.map((s) => (s._id === sessionId ? res.data.session : s)));
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Error processing session');
    }
  };

  const handleCompleteSession = async (sessionId) => {
    try {
      const res = await axios.put(
        `/api/sessions/complete/${sessionId}`,
        {},
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      toast.success(res.data.msg);
      setSessions(sessions.map((s) => (s._id === sessionId ? { ...s, status: 'completed' } : s)));
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Error completing session');
    }
  };

  const handleRescheduleChange = (field, value) => {
    setRescheduleData((prev) => ({ ...prev, [field]: value }));
  };

  const isSessionActive = (session) => {
    const now = new Date();
    const startTime = new Date(session.date);
    const endTime = new Date(startTime.getTime() + session.duration * 60000);
    // Allow joining 5 minutes before start
    const earlyStart = new Date(startTime.getTime() - 5 * 60000);
    return session.status === 'confirmed' && now >= earlyStart && now <= endTime;
  };

  if (loading) return <div className="container">Loading dashboard...</div>;

  const pendingRequests = sessions.filter(
    (s) => s.teacherId._id === user.id && s.status === 'pending'
  );
  const activeSessions = sessions.filter(isSessionActive);

  return (
    <div className="container dashboard">
      <h1 className="dashboard-title">Welcome, {user.username}!</h1>
      {activeSessions.length > 0 && (
        <section className="dashboard-section">
          <h2>Active Sessions</h2>
          <div className="session-grid">
            {activeSessions.map((session) => (
              <div key={session._id} className="session-card notification-card">
                <img src={session.learnerId.profileImage || ProfileImg} alt="Learner" className="session-image" />
                <div className="session-details">
                  <h3>{session.skillId.name}</h3>
                  <p><strong>With:</strong> {session.teacherId._id === user.id ? session.learnerId.username : session.teacherId.username}</p>
                  <p><strong>Date:</strong> {new Date(session.date).toLocaleString()}</p>
                  <p><strong>Duration:</strong> {session.duration} minutes</p>
                  <p><strong>Type:</strong> {session.type}</p>
                  <div className="session-actions">
                    <a
                      href={session.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="join-session-btn"
                    >
                      Join Session
                    </a>
                    <button
                      onClick={() => handleCompleteSession(session._id)}
                      className="complete-session-btn"
                    >
                      End Session
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      {pendingRequests.length > 0 && (
        <section className="dashboard-section">
          <h2>Pending Session Requests</h2>
          <div className="session-grid">
            {pendingRequests.map((session) => (
              <div key={session._id} className="session-card notification-card">
                <img src={session.learnerId.profileImage || ProfileImg} alt="Learner" className="session-image" />
                <div className="session-details">
                  <h3>{session.skillId.name}</h3>
                  <p><strong>Requested by:</strong> {session.learnerId.username}</p>
                  <p><strong>Date:</strong> {new Date(session.date).toLocaleString()}</p>
                  <p><strong>Duration:</strong> {session.duration} minutes</p>
                  <p><strong>Type:</strong> {session.type}</p>
                  <div className="session-actions">
                    <button
                      onClick={() => handleSessionAction(session._id, 'confirm')}
                      className="confirm-btn"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleSessionAction(session._id, 'reject')}
                      className="reject-btn"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      <section className="dashboard-section">
        <h2>Profile Stats</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Sessions</h3>
            <p>{stats.totalSessions}</p>
          </div>
          <div className="stat-card">
            <h3>Completed Sessions</h3>
            <p>{stats.completedSessions}</p>
          </div>
          <div className="stat-card">
            <h3>Average Rating</h3>
            <p>{stats.rating}/5</p>
          </div>
        </div>
      </section>
      <section className="dashboard-section">
        <h2>Scheduled Sessions</h2>
        {sessions.length ? (
          <div className="session-grid">
            {sessions.map((session) => (
              <div key={session._id} className="session-card">
                <img src={ProfileImg} alt="Teacher" className="session-image" />
                <div className="session-details">
                  <h3>{session.skillId.name}</h3>
                  <p><strong>Teacher:</strong> {session.teacherId.username}</p>
                  <p><strong>Learner:</strong> {session.learnerId.username}</p>
                  <p><strong>Date:</strong> {new Date(session.date).toLocaleString()}</p>
                  <p><strong>Duration:</strong> {session.duration} minutes</p>
                  <p><strong>Type:</strong> {session.type}</p>
                  <p><strong>Status:</strong> {session.status}</p>
                  {rescheduleSessionId === session._id ? (
                    <div className="reschedule-form">
                      <h4>Reschedule Session</h4>
                      <DatePicker
                        selected={rescheduleData.date}
                        onChange={(date) => handleRescheduleChange('date', date)}
                        showTimeSelect
                        minDate={new Date()}
                      />
                      <select
                        value={rescheduleData.duration}
                        onChange={(e) => handleRescheduleChange('duration', Number(e.target.value))}
                      >
                        <option value={30}>30 min</option>
                        <option value={60}>1 hr</option>
                        <option value={90}>1.5 hr</option>
                      </select>
                      <select
                        value={rescheduleData.type}
                        onChange={(e) => handleRescheduleChange('type', e.target.value)}
                      >
                        <option value="virtual">Virtual</option>
                        <option value="in-person">In-Person</option>
                      </select>
                      <button
                        onClick={() => handleRescheduleSession(session._id)}
                        className="confirm-reschedule-btn"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setRescheduleSessionId(null)}
                        className="cancel-reschedule-btn"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    session.status !== 'completed' &&
                    session.status !== 'cancelled' &&
                    session.status !== 'rejected' && (
                      <div className="session-actions">
                        {(session.learnerId._id === user.id || session.teacherId._id === user.id) && (
                          <button
                            onClick={() => handleCancelSession(session._id)}
                            className="cancel-session-btn"
                          >
                            Cancel
                          </button>
                        )}
                        {session.learnerId._id === user.id && (
                          <button
                            onClick={() => handleRescheduleSession(session._id)}
                            className="reschedule-session-btn"
                          >
                            Reschedule
                          </button>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No sessions scheduled.</p>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
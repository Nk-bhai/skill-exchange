import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import ProfileImg from '../assets/profile-placeholder.png'


function Dashboard({ user }) {
  const [sessions, setSessions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [stats, setStats] = useState({ totalSessions: 0, completedSessions: 0, rating: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return navigate('/auth');

    const fetchData = async () => {
      try {
        const [sessionsRes, matchesRes] = await Promise.all([
          axios.get('/api/sessions/my-sessions', { headers: { 'x-auth-token': localStorage.getItem('token') } }),
          axios.get('/api/matches', { headers: { 'x-auth-token': localStorage.getItem('token') } })
        ]);
        setSessions(sessionsRes.data);
        setMatches(matchesRes.data);
        setStats({
          totalSessions: sessionsRes.data.length,
          completedSessions: sessionsRes.data.filter(s => s.status === 'completed').length,
          rating: user.ratings?.length ? (user.ratings.reduce((sum, r) => sum + r.rating, 0) / user.ratings.length).toFixed(1) : 0
        });
        setLoading(false);
      } catch (error) {
        toast.error(error.response?.data?.msg || 'Error fetching dashboard data');
        setLoading(false);
      }
    };
    fetchData();
  }, [user, navigate]);

  const handleCancelSession = async (sessionId) => {
    try {
      const res = await axios.delete(`/api/sessions/cancel/${sessionId}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      toast.success(res.data.msg);
      setSessions(sessions.map(s => s._id === sessionId ? { ...s, status: 'cancelled' } : s));
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Error cancelling session');
    }
  };

  const handleRescheduleSession = () => {
    toast.info('Rescheduling not fully implemented!');
  };

  if (loading) return <div className="container">Loading dashboard...</div>;

  return (
    <div className="container dashboard">
      <h1 className="dashboard-title">Welcome, {user.username}!</h1>
      <section className="dashboard-section">
        <h2>Profile Stats</h2>
        <div className="stats-grid">
          <div className="stat-card"><h3>Total Sessions</h3><p>{stats.totalSessions}</p></div>
          <div className="stat-card"><h3>Completed Sessions</h3><p>{stats.completedSessions}</p></div>
          <div className="stat-card"><h3>Average Rating</h3><p>{stats.rating}/5</p></div>
        </div>
      </section>
      <section className="dashboard-section">
        <h2>Scheduled Sessions</h2>
        {sessions.length ? (
          <div className="session-grid">
            {sessions.map(session => (
              <div key={session._id} className="session-card">
                <img src={ProfileImg} alt="Teacher" className="session-image" />
                <div className="session-details">
                  <h3>{session.skillId.name}</h3>
                  <p><strong>Teacher:</strong> {session.teacherId.username}</p>
                  <p><strong>Date:</strong> {new Date(session.date).toLocaleString()}</p>
                  <p><strong>Status:</strong> {session.status}</p>
                  {session.status !== 'completed' && session.status !== 'cancelled' && (
                    <div className="session-actions">
                      <button onClick={() => handleCancelSession(session._id)} className="cancel-session-btn">Cancel</button>
                      <button onClick={() => handleRescheduleSession()} className="reschedule-session-btn">Reschedule</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : <p>No sessions scheduled.</p>}
      </section>
      <section className="dashboard-section">
        <h2>Recommended Matches</h2>
        {matches.length ? (
          <div className="match-grid">
            {matches.map(match => (
              <div key={match._id} className="match-card">
                <img src={ProfileImg} alt="Tutor" className="match-image" />
                <div className="match-details">
                  <h3>{match.name}</h3>
                  <p><strong>Tutor:</strong> {match.userId.username}</p>
                </div>
              </div>
            ))}
          </div>
        ) : <p>No matches found.</p>}
      </section>
    </div>
  );
}

export default Dashboard;
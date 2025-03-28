import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SkillList from '../components/SkillList';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import ProfileImg from '../assets/profile-placeholder.png'


function Skills({ user }) {
  const [skills, setSkills] = useState([]);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [date, setDate] = useState(new Date());
  const [duration, setDuration] = useState(60);
  const [type, setType] = useState('virtual');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [skillsRes, matchesRes] = await Promise.all([
          axios.get('/api/skills'),
          user ? axios.get('/api/matches', { headers: { 'x-auth-token': localStorage.getItem('token') } }) : Promise.resolve({ data: [] })
        ]);
        setSkills(skillsRes.data);
        setFilteredSkills(skillsRes.data);
        setCategories([...new Set(skillsRes.data.map(skill => skill.category))]);
        setMatches(matchesRes.data);
        setLoading(false);
      } catch (error) {
        toast.error(error.response?.data?.msg || 'Error fetching skills');
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleFilter = (category) => {
    setFilteredSkills(category ? skills.filter(skill => skill.category === category) : skills);
  };

  const handleScheduleMatch = async (match) => {
    if (!user) return toast.error('Please login to schedule a session');
    if (selectedMatch && selectedMatch._id === match._id) {
      try {
        const res = await axios.post('/api/sessions/schedule', {
          teacherId: match.userId._id,
          skillId: match._id,
          date,
          duration,
          type
        }, { headers: { 'x-auth-token': localStorage.getItem('token') } });
        toast.success('Session scheduled!');
        setSelectedMatch(null);
      } catch (error) {
        toast.error(error.response?.data?.msg || 'Error scheduling session');
      }
    } else {
      setSelectedMatch(match);
    }
  };

  const renderScheduleForm = (match) => (
    <div className="schedule-form">
      <DatePicker selected={date} onChange={setDate} showTimeSelect minDate={new Date()} />
      <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
        <option value={30}>30 min</option>
        <option value={60}>1 hr</option>
        <option value={90}>1.5 hr</option>
      </select>
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="virtual">Virtual</option>
        <option value="in-person">In-Person</option>
      </select>
      <button onClick={() => handleScheduleMatch(match)}>Confirm</button>
    </div>
  );

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <h1 className="page-title">Available Skills</h1>
      {user && matches.length > 0 && (
        <div className="matches-preview">
          <h2>Recommended Matches</h2>
          <div className="skill-grid">
            {matches.map(match => (
              <div key={match._id} className="skill-card ">
                <img src={ProfileImg} alt="Tutor" className="skill-image" />
                <h3 className="skill-name">{match.name}</h3>
                <p className="skill-tutor">Tutor: {match.userId.username}</p>
                <p className="skill-desc">{match.description || 'No description'}</p>
                {selectedMatch && selectedMatch._id === match._id ? (
                  renderScheduleForm(match)
                ) : (
                  <button onClick={() => handleScheduleMatch(match)} className="schedule-btn">Schedule Session</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <SkillList skills={filteredSkills} user={user} onFilter={handleFilter} categories={categories} />
    </div>
  );
}

export default Skills;
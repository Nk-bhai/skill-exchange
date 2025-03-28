import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { toast } from 'react-toastify';
import axios from 'axios';
import ProfileImg from '../assets/profile-placeholder.png'


function SkillList({ skills, user, onFilter, categories }) {
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [date, setDate] = useState(new Date());
  const [duration, setDuration] = useState(60);
  const [type, setType] = useState('virtual');

  const handleSchedule = async (skill) => {
    if (!user) return toast.error('Please login to schedule a session');
    if (selectedSkill && selectedSkill._id === skill._id) {
      try {
        const res = await axios.post('/api/sessions/schedule', {
          teacherId: skill.userId._id,
          skillId: skill._id,
          date,
          duration,
          type
        }, { headers: { 'x-auth-token': localStorage.getItem('token') } });
        toast.success('Session scheduled!');
        setSelectedSkill(null);
      } catch (error) {
        toast.error(error.response?.data?.msg || 'Error scheduling session');
      }
    } else {
      setSelectedSkill(skill);
    }
  };

  const renderScheduleForm = (skill) => (
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
      <button onClick={() => handleSchedule(skill)}>Confirm</button>
    </div>
  );

  return (
    <div className="skill-list-container">
      <div className="filter-section">
        <label>Filter by Category: </label>
        <select onChange={(e) => onFilter(e.target.value)}>
          <option value="">All</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>{category}</option>
          ))}
        </select>
      </div>
      <div className="skill-grid">
        {skills.map(skill => (
          <div key={skill._id} className="skill-card">
            <img src={ProfileImg} alt="Tutor" className="skill-image" />
            <h3 className="skill-name">{skill.name}</h3>
            <p className="skill-category">Category: {skill.category}</p>
            <p className="skill-tutor">Tutor: {skill.userId.username}</p>
            <p className="skill-desc">{skill.description || 'No description'}</p>
            {selectedSkill && selectedSkill._id === skill._id ? (
              renderScheduleForm(skill)
            ) : (
              <button onClick={() => handleSchedule(skill)} className="schedule-btn">Schedule Session</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SkillList;
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ProfileImg from '../assets/profile-placeholder.png'


function ProfileCard({ user, isOwnProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    skillsToTeach: user.skillsToTeach.join(', '),
    skillsToLearn: user.skillsToLearn.join(', '),
    bio: user.bio || '',
    profileImage: user.profileImage,
    location: user.location,
    experienceLevel: user.experienceLevel,
    interests: user.interests.join(', ')
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedData = {
        skillsToTeach: formData.skillsToTeach.split(',').map(s => s.trim()),
        skillsToLearn: formData.skillsToLearn.split(',').map(s => s.trim()),
        bio: formData.bio,
        profileImage: formData.profileImage,
        location: formData.location,
        experienceLevel: formData.experienceLevel,
        interests: formData.interests.split(',').map(i => i.trim())
      };
      const res = await axios.put('/api/users/profile', updatedData, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      toast.success('Profile updated!');
      setIsEditing(false);
      Object.assign(user, res.data);
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Error updating profile');
    }
  };

  return (
    <div className="profile-card">
      <div className="profile-header">
        <img src={ProfileImg} alt="Profile" className="profile-image" />
        <h2 className="profile-username">{user.username}</h2>
      </div>
      {isEditing ? (
        <form onSubmit={handleSubmit} className="profile-edit-form">
          <div className="form-group">
            <label>Skills to Teach (comma-separated)</label>
            <input type="text" name="skillsToTeach" value={formData.skillsToTeach} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Skills to Learn (comma-separated)</label>
            <input type="text" name="skillsToLearn" value={formData.skillsToLearn} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Bio</label>
            <textarea name="bio" value={formData.bio} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Profile Image URL</label>
            <input type="text" name="profileImage" value={formData.profileImage} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Experience Level</label>
            <select name="experienceLevel" value={formData.experienceLevel} onChange={handleChange}>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div className="form-group">
            <label>Interests (comma-separated)</label>
            <input type="text" name="interests" value={formData.interests} onChange={handleChange} />
          </div>
          <button type="submit" className="save-btn">Save</button>
          <button type="button" onClick={() => setIsEditing(false)} className="cancel-btn">Cancel</button>
        </form>
      ) : (
        <>
          <p className="profile-bio">{user.bio || 'No bio available'}</p>
          <p className="profile-detail"><strong>Location:</strong> {user.location}</p>
          <p className="profile-detail"><strong>Experience:</strong> {user.experienceLevel}</p>
          <div className="profile-section">
            <h3>Interests</h3>
            <ul className="skill-list">
              {user.interests.length ? user.interests.map((interest, index) => (
                <li key={index} className="skill-item">{interest}</li>
              )) : <li>No interests listed</li>}
            </ul>
          </div>
          <div className="profile-section">
            <h3>Skills to Teach</h3>
            <ul className="skill-list">
              {user.skillsToTeach.length ? user.skillsToTeach.map((skill, index) => (
                <li key={index} className="skill-item">{skill}</li>
              )) : <li>No skills listed</li>}
            </ul>
          </div>
          <div className="profile-section">
            <h3>Skills to Learn</h3>
            <ul className="skill-list">
              {user.skillsToLearn.length ? user.skillsToLearn.map((skill, index) => (
                <li key={index} className="skill-item">{skill}</li>
              )) : <li>No skills listed</li>}
            </ul>
          </div>
          {isOwnProfile && <button onClick={() => setIsEditing(true)} className="edit-btn">Edit Profile</button>}
        </>
      )}
    </div>
  );
}

export default ProfileCard;
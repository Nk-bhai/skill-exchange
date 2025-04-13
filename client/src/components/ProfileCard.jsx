import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ProfileImg from '../assets/profile-placeholder.png';

function ProfileCard({ user, isOwnProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user.username || '',
    bio: user.bio || '',
    location: user.location || '',
    experienceLevel: user.experienceLevel || 'Beginner',
    interests: user.interests?.join(', ') || '',
    skillsToTeach: user.skillsToTeach?.join(', ') || '',
    skillsToLearn: user.skillsToLearn?.join(', ') || '',
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedData = {
        ...formData,
        interests: formData.interests.split(',').map((item) => item.trim()).filter(Boolean),
        skillsToTeach: formData.skillsToTeach.split(',').map((item) => item.trim()).filter(Boolean),
        skillsToLearn: formData.skillsToLearn.split(',').map((item) => item.trim()).filter(Boolean),
      };
      const res = await axios.put(
        '/api/users/profile',
        updatedData,
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      toast.success('Profile updated! Skills are now available to teach.');
      setIsEditing(false);
      Object.assign(user, res.data); // Update local user object
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Error updating profile');
    }
  };

  return (
    <div className="profile-card">
      <img src={user.profileImage || ProfileImg} alt="Profile" className="profile-image" />
      {isEditing ? (
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Username"
              required
            />
          </div>
          <div className="form-group">
            <label>Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Tell us about yourself"
            />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Location"
            />
          </div>
          <div className="form-group">
            <label>Experience Level</label>
            <select
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleInputChange}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div className="form-group">
            <label>Interests</label>
            <input
              type="text"
              name="interests"
              value={formData.interests}
              onChange={handleInputChange}
              placeholder="Interests (e.g., coding, music)"
            />
          </div>
          <div className="form-group">
            <label>Skills to Teach</label>
            <input
              type="text"
              name="skillsToTeach"
              value={formData.skillsToTeach}
              onChange={handleInputChange}
              placeholder="Skills to teach (e.g., Python, JavaScript)"
            />
            <small>Enter skills you can teach, separated by commas</small>
          </div>
          <div className="form-group">
            <label>Skills to Learn</label>
            <input
              type="text"
              name="skillsToLearn"
              value={formData.skillsToLearn}
              onChange={handleInputChange}
              placeholder="Skills to learn (e.g., Data Science, UI Design)"
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="save-btn">Save</button>
            <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-details">
          <h2>{user.username}</h2>
          <p><strong>Bio:</strong> {user.bio || 'No bio'}</p>
          <p><strong>Location:</strong> {user.location || 'Not specified'}</p>
          <p><strong>Experience:</strong> {user.experienceLevel}</p>
          <p><strong>Interests:</strong> {user.interests?.join(', ') || 'None'}</p>
          <p><strong>Skills to Teach:</strong> {user.skillsToTeach?.join(', ') || 'None'}</p>
          <p><strong>Skills to Learn:</strong> {user.skillsToLearn?.join(', ') || 'None'}</p>
          {isOwnProfile && (
            <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
          )}
        </div>
      )}
    </div>
  );
}

export default ProfileCard;
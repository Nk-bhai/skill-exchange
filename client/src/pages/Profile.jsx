import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProfileCard from '../components/ProfileCard';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';

function Profile({ user }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const isOwnProfile = user && user.id === id;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/api/users/profile/${id}`, {
          headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        setProfile(res.data);
        setLoading(false);
      } catch (error) {
        toast.error(error.response?.data?.msg || 'Error fetching profile');
        setLoading(false);
        if (error.response?.status === 401) navigate('/auth');
      }
    };
    fetchProfile();
  }, [id, navigate]);

  if (loading) return <div className="container">Loading profile...</div>;
  if (!profile) return <div className="container">Profile not found</div>;

  return (
    <div className="container">
      <ProfileCard user={profile} isOwnProfile={isOwnProfile} />
    </div>
  );
}

export default Profile;
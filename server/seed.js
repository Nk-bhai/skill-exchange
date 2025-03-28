const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Skill = require('./models/Skill');
const Session = require('./models/Session');
require('dotenv').config();

const seedData = async () => {
  try {
    await connectDB();
    await User.deleteMany({});
    await Skill.deleteMany({});
    await Session.deleteMany({});
    console.log('Existing data cleared');

    const users = [
      { username: 'Rahul_Sharma', email: 'rahul@example.com', password: await bcrypt.hash('password123', 10), skillsToTeach: ['JavaScript', 'React'], skillsToLearn: ['Python', 'Data Science'], bio: 'Web developer with a passion for coding.', profileImage: '/profile-placeholder.png', location: 'Mumbai, India', experienceLevel: 'Intermediate', interests: ['Cricket', 'Music'] },
      { username: 'Priya_Verma', email: 'priya@example.com', password: await bcrypt.hash('password123', 10), skillsToTeach: ['Python', 'Machine Learning'], skillsToLearn: ['JavaScript', 'UI Design'], bio: 'Data enthusiast who loves teaching.', profileImage: '/profile-placeholder.png', location: 'Delhi, India', experienceLevel: 'Advanced', interests: ['AI', 'Travel'] },
      { username: 'Amit_Patel', email: 'amit@example.com', password: await bcrypt.hash('password123', 10), skillsToTeach: ['UI Design', 'Graphic Design'], skillsToLearn: ['React', 'Node.js'], bio: 'Creative designer exploring tech.', profileImage: '/profile-placeholder.png', location: 'Ahmedabad, India', experienceLevel: 'Beginner', interests: ['Art', 'Movies'] },
      { username: 'Neha_Singh', email: 'neha@example.com', password: await bcrypt.hash('password123', 10), skillsToTeach: ['Java', 'Spring Boot'], skillsToLearn: ['Cloud Computing', 'DevOps'], bio: 'Backend developer with enterprise experience.', profileImage: '/profile-placeholder.png', location: 'Bangalore, India', experienceLevel: 'Intermediate', interests: ['Tech Blogs', 'Yoga'] },
      { username: 'Vikram_Mehta', email: 'vikram@example.com', password: await bcrypt.hash('password123', 10), skillsToTeach: ['Node.js', 'MongoDB'], skillsToLearn: ['Machine Learning', 'AI'], bio: 'Full-stack developer building scalable apps.', profileImage: '/profile-placeholder.png', location: 'Pune, India', experienceLevel: 'Advanced', interests: ['Startups', 'Chess'] },
      { username: 'Sneha_Reddy', email: 'sneha@example.com', password: await bcrypt.hash('password123', 10), skillsToTeach: ['Digital Marketing', 'SEO'], skillsToLearn: ['Graphic Design', 'Content Writing'], bio: 'Marketing expert helping brands grow.', profileImage: '/profile-placeholder.png', location: 'Hyderabad, India', experienceLevel: 'Intermediate', interests: ['Photography', 'Cooking'] },
      { username: 'Karan_Gupta', email: 'karan@example.com', password: await bcrypt.hash('password123', 10), skillsToTeach: ['Cloud Computing', 'AWS'], skillsToLearn: ['JavaScript', 'React'], bio: 'Cloud architect with a focus on scalability.', profileImage: '/profile-placeholder.png', location: 'Chennai, India', experienceLevel: 'Advanced', interests: ['Gaming', 'Tech Talks'] }
    ];

    const insertedUsers = await User.insertMany(users);
    console.log('Users seeded');

    const skills = [
      { name: 'JavaScript', category: 'Programming', userId: insertedUsers[0]._id, description: 'Learn modern JavaScript ES6+.' },
      { name: 'React', category: 'Programming', userId: insertedUsers[0]._id, description: 'Build dynamic web apps with React.' },
      { name: 'Python', category: 'Programming', userId: insertedUsers[1]._id, description: 'Master Python for coding and data analysis.' },
      { name: 'Machine Learning', category: 'Data Science', userId: insertedUsers[1]._id, description: 'Intro to ML with Python.' },
      { name: 'UI Design', category: 'Design', userId: insertedUsers[2]._id, description: 'Create user-friendly interfaces.' },
      { name: 'Graphic Design', category: 'Design', userId: insertedUsers[2]._id, description: 'Design stunning visuals.' },
      { name: 'Java', category: 'Programming', userId: insertedUsers[3]._id, description: 'Learn Java for enterprise apps.' },
      { name: 'Spring Boot', category: 'Programming', userId: insertedUsers[3]._id, description: 'Build REST APIs with Spring Boot.' },
      { name: 'Node.js', category: 'Programming', userId: insertedUsers[4]._id, description: 'Server-side JavaScript with Node.' },
      { name: 'MongoDB', category: 'Database', userId: insertedUsers[4]._id, description: 'NoSQL database essentials.' },
      { name: 'Digital Marketing', category: 'Marketing', userId: insertedUsers[5]._id, description: 'Grow your online presence.' },
      { name: 'SEO', category: 'Marketing', userId: insertedUsers[5]._id, description: 'Optimize for search engines.' },
      { name: 'Cloud Computing', category: 'DevOps', userId: insertedUsers[6]._id, description: 'Master cloud infrastructure.' },
      { name: 'AWS', category: 'DevOps', userId: insertedUsers[6]._id, description: 'Learn Amazon Web Services.' }
    ];

    const insertedSkills = await Skill.insertMany(skills);
    console.log('Skills seeded');

    const sessions = [
      { teacherId: insertedUsers[0]._id, learnerId: insertedUsers[1]._id, skillId: insertedSkills[0]._id, date: new Date('2025-04-01T10:00:00Z'), duration: 60, type: 'virtual', status: 'confirmed' },
      { teacherId: insertedUsers[1]._id, learnerId: insertedUsers[2]._id, skillId: insertedSkills[2]._id, date: new Date('2025-04-02T14:00:00Z'), duration: 90, type: 'in-person', status: 'pending' },
      { teacherId: insertedUsers[2]._id, learnerId: insertedUsers[3]._id, skillId: insertedSkills[4]._id, date: new Date('2025-04-03T09:30:00Z'), duration: 45, type: 'virtual', status: 'confirmed' },
      { teacherId: insertedUsers[3]._id, learnerId: insertedUsers[4]._id, skillId: insertedSkills[6]._id, date: new Date('2025-04-04T15:00:00Z'), duration: 60, type: 'virtual', status: 'pending' },
      { teacherId: insertedUsers[4]._id, learnerId: insertedUsers[5]._id, skillId: insertedSkills[8]._id, date: new Date('2025-04-05T11:00:00Z'), duration: 90, type: 'in-person', status: 'confirmed' },
      { teacherId: insertedUsers[5]._id, learnerId: insertedUsers[6]._id, skillId: insertedSkills[10]._id, date: new Date('2025-04-06T13:00:00Z'), duration: 60, type: 'virtual', status: 'pending' },
      { teacherId: insertedUsers[6]._id, learnerId: insertedUsers[0]._id, skillId: insertedSkills[12]._id, date: new Date('2025-04-07T10:30:00Z'), duration: 75, type: 'virtual', status: 'confirmed' }
    ];

    await Session.insertMany(sessions);
    console.log('Sessions seeded');

    console.log('Database seeded successfully!');
    process.exit(0);  
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
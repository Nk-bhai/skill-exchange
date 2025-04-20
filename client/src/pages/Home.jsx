import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home-container">
      <style>
        {`
          .home-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
            font-family: Arial, sans-serif;
            color: #333;
          }

          /* Hero Section */
          .hero-section {
            background: linear-gradient(135deg, #3498db, #2ecc71);
            border-radius: 8px;
            padding: 60px 20px;
            text-align: center;
            color: white;
            margin-bottom: 40px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          }

          .hero-section h1 {
            font-size: 48px;
            margin-bottom: 20px;
            font-weight: bold;
          }

          .hero-section p {
            font-size: 20px;
            margin-bottom: 30px;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
          }

          .cta-buttons {
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
          }

          .cta-button {
            background-color: #2c3e50;
            color: white;
            padding: 12px 24px;
            border-radius: 5px;
            text-decoration: none;
            font-size: 18px;
            transition: background-color 0.3s, transform 0.2s;
          }

          .cta-button:hover {
            background-color: #34495e;
            transform: translateY(-2px);
          }

          .cta-button.secondary {
            background-color: #e74c3c;
          }

          .cta-button.secondary:hover {
            background-color: #c0392b;
          }

          /* Features Section */
          .features-section {
            margin-bottom: 40px;
          }

          .features-section h2 {
            font-size: 32px;
            color: #2c3e50;
            text-align: center;
            margin-bottom: 30px;
          }

          .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
          }

          .feature-card {
            background-color: white;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s;
          }

          .feature-card:hover {
            transform: translateY(-5px);
          }

          .feature-card img {
            width: 60px;
            height: 60px;
            margin-bottom: 15px;
          }

          .feature-card h3 {
            font-size: 22px;
            color: #2c3e50;
            margin-bottom: 10px;
          }

          .feature-card p {
            font-size: 16px;
            color: #666;
          }

          /* How It Works Section */
          .how-it-works-section {
            background-color: #fff;
            padding: 40px 20px;
            border-radius: 8px;
            margin-bottom: 40px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .how-it-works-section h2 {
            font-size: 32px;
            color: #2c3e50;
            text-align: center;
            margin-bottom: 30px;
          }

          .steps-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            text-align: center;
          }

          .step {
            padding: 20px;
          }

          .step-number {
            display: inline-block;
            width: 40px;
            height: 40px;
            line-height: 40px;
            background-color: #3498db;
            color: white;
            border-radius: 50%;
            font-size: 20px;
            margin-bottom: 15px;
          }

          .step h3 {
            font-size: 20px;
            color: #2c3e50;
            margin-bottom: 10px;
          }

          .step p {
            font-size: 16px;
            color: #666;
          }

          /* Footer */
          .footer {
            text-align: center;
            padding: 20px 0;
            background-color: #2c3e50;
            color: white;
            border-radius: 8px;
          }

          .footer p {
            margin-bottom: 10px;
            font-size: 16px;
          }

          .footer-links {
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
          }

          .footer-link {
            color: #3498db;
            text-decoration: none;
            font-size: 16px;
            transition: color 0.3s;
          }

          .footer-link:hover {
            color: #2ecc71;
          }

          /* Responsive Design */
          @media (max-width: 768px) {
            .hero-section h1 {
              font-size: 36px;
            }

            .hero-section p {
              font-size: 18px;
            }

            .cta-button {
              padding: 10px 20px;
              font-size: 16px;
            }

            .features-section h2,
            .how-it-works-section h2 {
              font-size: 28px;
            }

            .feature-card h3,
            .step h3 {
              font-size: 20px;
            }

            .feature-card p,
            .step p {
              font-size: 14px;
            }
          }

          @media (max-width: 600px) {
            .cta-buttons {
              flex-direction: column;
              gap: 10px;
            }

            .feature-grid,
            .steps-grid {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

      {/* Hero Section */}
      <section className="hero-section">
        <h1>Welcome to Skill Exchange</h1>
        <p>Connect with others to teach and learn new skills in a vibrant community!</p>
        <div className="cta-buttons">
          <Link to="/skills" className="cta-button">
            Explore Skills
          </Link>
          <Link to="/auth" className="cta-button secondary">
            Join Now
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Why Skill Exchange?</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <img
              src="https://img.icons8.com/ios-filled/50/000000/teacher.png"
              alt="Teach Icon"
            />
            <h3>Teach Your Skills</h3>
            <p>Share your expertise with learners and build your reputation.</p>
          </div>
          <div className="feature-card">
            <img
              src="https://img.icons8.com/ios-filled/50/000000/student-male.png"
              alt="Learn Icon"
            />
            <h3>Learn New Skills</h3>
            <p>Discover a wide range of skills from experienced tutors.</p>
          </div>
          <div className="feature-card">
            <img
              src="https://img.icons8.com/ios-filled/50/000000/handshake.png"
              alt="Connect Icon"
            />
            <h3>Connect with Others</h3>
            <p>Join a community of learners and teachers to grow together.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <h2>How It Works</h2>
        <div className="steps-grid">
          <div className="step">
            <span className="step-number">1</span>
            <h3>Sign Up</h3>
            <p>Create an account to join the Skill Exchange community.</p>
          </div>
          <div className="step">
            <span className="step-number">2</span>
            <h3>Browse Skills</h3>
            <p>Explore skills to learn or offer your own expertise.</p>
          </div>
          <div className="step">
            <span className="step-number">3</span>
            <h3>Schedule Sessions</h3>
            <p>Book sessions with teachers or accept student requests.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>Skill Exchange: Learn, Teach, Connect</p>
        <div className="footer-links">
          <Link to="/skills" className="footer-link">
            Skills
          </Link>
          <Link to="/dashboard" className="footer-link">
            Dashboard
          </Link>
          <Link to="/auth" className="footer-link">
            Login/Register
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default Home;
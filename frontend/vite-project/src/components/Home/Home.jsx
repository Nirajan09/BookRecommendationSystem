import { Link } from 'react-router-dom';
import './Home.css';
import { useAuth } from '../../utils/AuthContext/AuthContext';

export default function Home() {
  const { token } = useAuth();
  return (
    <div className="home-bg">
      <main className="home-content">
        <div className="home-text-block">
          <h1>Welcome to BookStore</h1>
          <p>
            Discover your next favorite book.<br />
            Register or log in to get personalized recommendations!
          </p>
          <div className="home-actions">
            <Link to={`${token?'/dashboard':'/login'}`} className="home-btn">Get Started</Link>
          </div>
        </div>
        <div className="home-image-block">
          <img src="../homeImage.jpg" alt="Books and reading" className="home-image" />
        </div>
      </main>
    </div>
  );
}

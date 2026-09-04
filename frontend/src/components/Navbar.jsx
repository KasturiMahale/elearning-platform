import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav style={{ display: 'flex', gap: '20px', padding: '15px', background: '#f0f0f0', alignItems: 'center' }}>
      <Link to="/">Home</Link>
      <Link to="/courses">Courses</Link>

      {user ? (
        <>
          <Link to="/my-learning">My Learning</Link>
          {user.role === 'instructor' && <Link to="/create-course">Create Course</Link>}
          <span>Hi, {user.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link>
        </>
      )}
    </nav>
  );
}

export default Navbar;
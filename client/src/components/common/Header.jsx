import React, { useContext } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'; 

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to the homepage after logging out
  };

  return (
    <div className="header">
      <Navbar expand="lg">
        <Navbar.Brand as={Link} to="/">
          <img src="/assets/images/logo2.png" alt="logo" className="width25" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="links left-links justify-content-start">
            <Nav.Link 
              className={location.pathname === '/' ? 'activelink' : ''}
              as={Link} 
              to="/">
              Home
            </Nav.Link>
            <Nav.Link 
              className={location.pathname === '/about' ? 'activelink' : ''}
              as={Link} 
              to="/about">
              About
            </Nav.Link>
            <Nav.Link 
              className={location.pathname === '/contact' ? 'activelink' : ''}
              as={Link} 
              to="/contact">
              Contact
            </Nav.Link>
          </Nav>

          {/* Right-aligned links */}
          <Nav className="links right-links justify-content-end ml-auto">
            {user ? (
              <>
                {user.role === 'Admin' && <Nav.Link className={location.pathname === '/AdminPage' ? 'activelink' : ''} as={Link} to="/AdminPage">Dashboard</Nav.Link>}
                {user.role === 'User' && <Nav.Link className={location.pathname === '/UserPage' ? 'activelink' : ''} as={Link} to="/UserPage">Dashboard</Nav.Link>}
                {user.role === 'Doctor' && <Nav.Link className={location.pathname === '/DoctorPage' ? 'activelink' : ''} as={Link} to="/DoctorPage">Dashboard</Nav.Link>}
                <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link className={location.pathname === '/login' ? 'activelink' : ''} as={Link} to="/login">Login</Nav.Link>
                <Nav.Link className={location.pathname === '/signup' ? 'activelink' : ''} as={Link} to="/signup">Sign Up</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </div>
  );
};

export default Header;

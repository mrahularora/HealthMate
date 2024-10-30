import React, { useContext } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom'; 
import { AuthContext } from '../../context/AuthContext'; 

const Header = () => {
  const { user, logout } = useContext(AuthContext); // Access user and logout function from context
  const navigate = useNavigate();

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
          <Nav className="ml-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/about">About</Nav.Link>
            <Nav.Link as={Link} to="/contact">Contact</Nav.Link>
            
            {/* Conditionally render based on user roles */}
            {user ? (
              <>
                {/* Render Dashboard link based on role */}
                {user.role === 'Admin' && <Nav.Link as={Link} to="/AdminPage">Dashboard</Nav.Link>}
                {user.role === 'User' && <Nav.Link as={Link} to="/userpage">Dashboard</Nav.Link>}
                {user.role === 'Doctor' && <Nav.Link as={Link} to="/doctorpage">Dashboard</Nav.Link>}
                <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/signup">Sign Up</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </div>
  );
};

export default Header;

import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom'; 

const Header = () => {
    return (
        <div className="header" bg="light">
        <Navbar expand="lg">
            <Navbar.Brand as={Link} to="/"><img src="/assets/images/logo2.png" alt="logo" className="width25" /></Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="ml-auto">
                    <Nav.Link as={Link} to="/">Home</Nav.Link>
                    <Nav.Link as={Link} to="/about">About</Nav.Link>
                    <Nav.Link as={Link} to="/contact">Contact</Nav.Link>
                    <Nav.Link as={Link} to="/login">Login</Nav.Link>
                    <Nav.Link as={Link} to="/signup">Sign Up</Nav.Link>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
        </div>
    );
};

export default Header;

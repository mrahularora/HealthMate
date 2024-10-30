import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="container d-flex flex-column justify-content-center align-items-center vh-100">
      <div className="text-center">
        <h2 className="display-4 text-danger">Unauthorized Access</h2>
        <p className="lead">You do not have permission to view this page.</p>
        <p>Please check your user role or contact support if you believe this is an error.</p>
        <Link to="/" className="btn btn-primary mt-3">
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;

import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="container text-center mt-5">
      <h1 className="display-1">404</h1>
      <p className="lead">Oops! The page you're looking for doesn't exist.</p>
      <p>
        <Link to="/" className="btn btn-primary">
          Go Back to Home
        </Link>
      </p>
    </div>
  );
};

export default NotFoundPage;
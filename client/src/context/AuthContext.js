import React, { createContext, useState } from 'react';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('User');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (userData) => {
    setUser(userData); // Set user data after successful login
    localStorage.setItem('User', JSON.stringify(userData)); // Save user info in localStorage
  };

  const logout = () => {
    setUser(null); // Clear user data on logout
    localStorage.removeItem('User'); // Remove user info from localStorage
  };

  const value = { user, login, logout }; // Provide login function to context

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };

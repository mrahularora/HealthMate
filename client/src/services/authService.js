import axios from './api'; 

let loggedInUser = null;

export const signup = async (userData) => {
  try {
    const response = await axios.post('/auth/signup', userData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const login = async (credentials) => {
  try {
    const response = await axios.post('/auth/login', credentials);
    console.log('Login response:', response); 
    loggedInUser = response.data.user; // Save logged-in user data
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const logout = async () => {
  try {
    await axios.post('/auth/logout');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

export const getLoggedInUser = () => {
  return loggedInUser; // Return the currently logged-in user
};

const authService = {
  signup,
  login,
  logout,
  getLoggedInUser,
};

export default authService;

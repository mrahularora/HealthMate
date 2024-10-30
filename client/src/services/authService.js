import axios from './api'; 

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

const authService = {
  signup,
  login,
  logout,
};

export default authService;

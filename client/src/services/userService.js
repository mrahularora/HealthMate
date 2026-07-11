import axios from './api';

export const editUser = async () => {
  try {
    const response = await axios.get('/auth/profile');
    return response.data.user;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw new Error(error.response?.data?.message || "Failed to load profile data.");
  }
};

export const updateUser = async (formData) => {
  try {
    const response = await axios.put('/auth/profile', formData);
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw new Error(error.response?.data?.message || "Failed to save changes. Please try again.");
  }
};

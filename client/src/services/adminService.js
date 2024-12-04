import axios from "./api";

// Get users with optional filter (role) and pagination
export const getUsers = (role = '', page = 1, limit = 10) => {
  return axios
    .get('/admin/users', {
      params: { role, page, limit },  // Pass page and limit for pagination
    })
    .then((response) => {
      return response.data;  // Assuming data will be in response.data
    })
    .catch((error) => {
      console.error("Error fetching users:", error);
      throw error;
    });
};

// Update user role
export const updateUserRole = (userId, role) => {
  return axios
    .put(`/admin/users/${userId}`, { role })
    .then((response) => response.data)
    .catch((error) => {
      console.error(`Error updating role for user ${userId}:`, error);
      throw error;
    });
};

// Delete user
export const deleteUser = (userId) => {
  return axios
    .delete(`/admin/users/${userId}`)
    .then((response) => response.data)
    .catch((error) => {
      console.error(`Error deleting user ${userId}:`, error);
      throw error;
    });
};

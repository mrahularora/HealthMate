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


// Fetch stats for the admin dashboard
export const fetchStats = async () => {
  try {
    const response = await axios.get('/admin/stats');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};

// Fetch details based on type
export const fetchDetails = async (type) => {
  try {
    const response = await axios.get(`/admin/details/${type}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching details for type: ${type}`, error);
    throw error;
  }
};


export const getAllContactDetails = async () => {
  try {
    const response = await axios.get("/admin/contacts", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching contact details:", error);
    throw error.response?.data || { message: "Failed to fetch contact details" };
  }
};

// Fetch all appointments grouped by doctor
export const getAllAppointments = async () => {
  try {
    const response = await axios.get("/admin/appointments");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw error.response?.data || { message: "Failed to fetch appointments" };
  }
};

// Fetch details of a single appointment
export const getAppointmentDetails = async (id) => {
  try {
    const response = await axios.get(`/admin/appointments/${id}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching appointment details:", error);
    throw error.response?.data || { message: "Failed to fetch appointment details" };
  }
};
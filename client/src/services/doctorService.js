import axios from "./api";

export const getPatientRecords = async () => {
  try {
    const response = await axios.get("/patients");
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch patient records");
  }
};

// Fetch all doctors
export const fetchDoctors = async () => {
  try {
    const response = await axios.get("/doctors");
    return response.data;
  } catch (error) {
    throw new Error("Error fetching doctors");
  }
};

// Search doctors by name or specialty via API
export const searchDoctorsByQuery = async (query) => {
  if (!query) return [];
  try {
    const response = await axios.get(
      `/doctors/search?query=${encodeURIComponent(query)}`
    );
    return response.data;
  } catch (error) {
    throw new Error("Error searching doctors");
  }
};

export const getDoctorList = async () => {
  return axios.get("/doctors");
};

export const fetchDoctorsFromSchema = async () => {
  try {
    const response = await axios.get("/doctors/list");
    return response.data;
  } catch (error) {
    throw new Error("Error fetching doctors from Doctor schema");
  }
};
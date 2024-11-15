import axios from './api'; 

export const getPatientRecords = async () => {
    try {
        const response = await axios.get('/patients');
        return response.data;
    } catch (error) {
        throw new Error('Failed to fetch patient records');
    }
};

// Fetch all doctors
export const fetchDoctors = async () => {
    try {
      const response = await axios.get('/doctors');
      return response.data; // Return the list of doctors
    } catch (error) {
      throw new Error('Error fetching doctors');
    }
};

// Search doctors by name or specialty
export const searchDoctors = (doctors, query) => {
    return doctors.filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(query.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(query.toLowerCase())
    );
};
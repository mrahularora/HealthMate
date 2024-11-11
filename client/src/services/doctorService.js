import axios from './api'; 

export const getPatientRecords = async () => {
    try {
        const response = await axios.get('/patients');
        return response.data;
    } catch (error) {
        throw new Error('Failed to fetch patient records');
    }
};

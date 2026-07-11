import axios from './api';

const submitContactForm = async ({ name, email, message }) => {
    try {
      const response = await axios.post('/contact', { name, email, message });
      return response.data; // Successfully submitted
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to submit the contact form.');
    }
  };

  export default submitContactForm;

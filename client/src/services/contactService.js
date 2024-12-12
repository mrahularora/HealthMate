const submitContactForm = async ({ name, email, message }) => {
    try {
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
  
      return data; // Successfully submitted
    } catch (error) {
      throw new Error(error.message || 'Failed to submit the contact form.');
    }
  };
  
  export default submitContactForm;
  
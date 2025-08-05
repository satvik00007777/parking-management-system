export const ValidateUser=(value,key)=>{

    if (!value || value.trim() === '') {
        return { valid: false, message: `${key} cannot be empty or undefined.` };
      }
  
      // Additional checks for specific fields:
      if (key === 'email') {
        // Validate email format using regex
        const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
        if (!emailRegex.test(value)) {
          return { valid: false, message: 'Invalid email format.' };
        }
      }
  
      if (key === 'contactnumber') {
        // Validate contact number (simple 10-digit validation for example)
        const contactNumberRegex = /^\d{10}$/;
        if (!contactNumberRegex.test(value)) {
          return { valid: false, message: 'Invalid contact number. It should be 10 digits.' };
        }
      }
  
      if (key === 'dob') {
        // Validate date of birth (e.g., should be a valid date format)
        const dobDate = new Date(value);
        if (isNaN(dobDate.getTime())) {
          return { valid: false, message: 'Invalid date of birth.' };
        }
      }
  
      if (key === 'vehicleno') {
        // Simple validation for vehicle number (this can be adjusted as per your format)
        const vehicleNoRegex = /^[A-Za-z0-9]{1,15}$/;
        if (!vehicleNoRegex.test(value)) {
          return { valid: false, message: 'Invalid vehicle number format.' };
        }
      }
      return { valid: true, message: 'All fields are valid.' };
}
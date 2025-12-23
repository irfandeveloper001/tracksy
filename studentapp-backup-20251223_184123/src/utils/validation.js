// Validation utilities
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // Minimum 6 characters
  return password && password.length >= 6;
};

export const validateStudentId = (studentId) => {
  return studentId && studentId.trim().length > 0;
};

export const validateName = (name) => {
  return name && name.trim().length >= 2;
};

export const validateForm = (fields) => {
  const errors = {};

  if (fields.email && !validateEmail(fields.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (fields.password) {
    if (!validatePassword(fields.password)) {
      errors.password = 'Password must be at least 6 characters';
    }
  }

  if (fields.password_confirmation && fields.password) {
    if (fields.password_confirmation !== fields.password) {
      errors.password_confirmation = 'Passwords do not match';
    }
  }

  if (fields.student_id && !validateStudentId(fields.student_id)) {
    errors.student_id = 'Please enter a valid student ID';
  }

  if (fields.name && !validateName(fields.name)) {
    errors.name = 'Name must be at least 2 characters';
  }

  if (fields.institution && !fields.institution.trim()) {
    errors.institution = 'Please select an institution';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};


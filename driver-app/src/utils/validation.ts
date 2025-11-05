// Validation utilities for form inputs

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Validate email
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password
export const validatePassword = (password: string): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Validate phone number
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone);
};

// Validate coordinates
export const validateCoordinates = (
  latitude: number,
  longitude: number
): boolean => {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

// Validate required fields
export const validateRequired = (
  fields: Record<string, any>
): ValidationResult => {
  const errors: Record<string, string> = {};

  Object.keys(fields).forEach((key) => {
    const value = fields[key];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      errors[key] = `${key} is required`;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Validate date range
export const validateDateRange = (
  startDate: string,
  endDate: string
): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!startDate) {
    errors.startDate = 'Start date is required';
  }
  if (!endDate) {
    errors.endDate = 'End date is required';
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      errors.dateRange = 'Start date must be before end date';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};


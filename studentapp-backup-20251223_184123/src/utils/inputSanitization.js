// Input sanitization utilities to prevent XSS and injection attacks

export const sanitizeInput = {
  // Sanitize string input
  string(input) {
    if (typeof input !== 'string') {
      return String(input || '');
    }

    // Remove potentially dangerous characters
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers (onclick=, etc.)
      .replace(/\s+/g, ' '); // Normalize whitespace
  },

  // Sanitize email
  email(email) {
    if (!email) return '';
    
    const sanitized = this.string(email);
    // Additional email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(sanitized) ? sanitized : '';
  },

  // Sanitize phone number
  phone(phone) {
    if (!phone) return '';
    
    // Remove all non-digit characters except + and -
    return phone.replace(/[^\d+\-]/g, '');
  },

  // Sanitize student ID
  studentId(id) {
    if (!id) return '';
    
    // Allow alphanumeric, hyphens, and underscores
    return id.replace(/[^a-zA-Z0-9\-_]/g, '');
  },

  // Sanitize URL
  url(url) {
    if (!url) return '';
    
    // Remove javascript: and data: protocols
    return url.replace(/^(javascript|data):/gi, '');
  },

  // Sanitize HTML (if needed)
  html(html) {
    if (!html) return '';
    
    // Remove all HTML tags
    return html.replace(/<[^>]*>/g, '');
  },

  // Sanitize number
  number(input) {
    if (typeof input === 'number') {
      return input;
    }
    
    const num = parseFloat(input);
    return isNaN(num) ? 0 : num;
  },

  // Sanitize integer
  integer(input) {
    if (typeof input === 'number') {
      return Math.floor(input);
    }
    
    const num = parseInt(input, 10);
    return isNaN(num) ? 0 : num;
  },

  // Sanitize object recursively
  object(obj) {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = this.string(key);
      
      if (typeof value === 'string') {
        sanitized[sanitizedKey] = this.string(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[sanitizedKey] = this.object(value);
      } else {
        sanitized[sanitizedKey] = value;
      }
    }

    return sanitized;
  },
};

// Validate and sanitize form data
export const sanitizeFormData = (formData) => {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(formData)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput.string(value);
    } else if (typeof value === 'number') {
      sanitized[key] = sanitizeInput.number(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeInput.object(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};


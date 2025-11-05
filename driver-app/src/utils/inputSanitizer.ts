// Input sanitization utilities to prevent XSS and injection attacks

class InputSanitizer {
  // Sanitize string input
  sanitizeString(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    // Remove potentially dangerous characters
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
  }

  // Sanitize email
  sanitizeEmail(email: string): string {
    const sanitized = this.sanitizeString(email);
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitized)) {
      throw new Error('Invalid email format');
    }
    return sanitized.toLowerCase();
  }

  // Sanitize phone number
  sanitizePhone(phone: string): string {
    const sanitized = this.sanitizeString(phone);
    // Remove non-digit characters except + and spaces
    return sanitized.replace(/[^\d+\s-]/g, '');
  }

  // Sanitize number
  sanitizeNumber(input: string | number): number {
    if (typeof input === 'number') {
      return isNaN(input) ? 0 : input;
    }

    const num = parseFloat(input);
    return isNaN(num) ? 0 : num;
  }

  // Sanitize coordinates
  sanitizeCoordinates(latitude: number, longitude: number): {
    latitude: number;
    longitude: number;
  } {
    const lat = this.sanitizeNumber(latitude);
    const lng = this.sanitizeNumber(longitude);

    // Validate coordinate ranges
    if (lat < -90 || lat > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }
    if (lng < -180 || lng > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }

    return { latitude: lat, longitude: lng };
  }

  // Sanitize object (recursive)
  sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized = { ...obj };

    for (const key in sanitized) {
      if (typeof sanitized[key] === 'string') {
        sanitized[key] = this.sanitizeString(sanitized[key]);
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeObject(sanitized[key]);
      }
    }

    return sanitized;
  }

  // Sanitize URL
  sanitizeURL(url: string): string {
    const sanitized = this.sanitizeString(url);
    
    // Validate URL format
    try {
      const urlObj = new URL(sanitized);
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new Error('Invalid URL protocol');
      }
      return sanitized;
    } catch (error) {
      throw new Error('Invalid URL format');
    }
  }
}

export default new InputSanitizer();


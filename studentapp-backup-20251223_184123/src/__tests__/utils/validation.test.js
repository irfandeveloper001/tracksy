import {
  validateEmail,
  validatePassword,
  validateStudentId,
  validateName,
} from '../../utils/validation';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('should return true for valid email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('student123@university.edu')).toBe(true);
    });

    it('should return false for invalid email addresses', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('invalid@')).toBe(false);
      expect(validateEmail('@invalid.com')).toBe(false);
      expect(validateEmail('invalid@.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(validateEmail(null)).toBe(false);
      expect(validateEmail(undefined)).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid passwords (min 6 characters)', () => {
      expect(validatePassword('password123')).toBe(true);
      expect(validatePassword('SecurePass!')).toBe(true);
      expect(validatePassword('123456')).toBe(true);
    });

    it('should return false for passwords shorter than 6 characters', () => {
      expect(validatePassword('short')).toBe(false);
      expect(validatePassword('12345')).toBe(false);
      expect(validatePassword('')).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(validatePassword(null)).toBe(false);
      expect(validatePassword(undefined)).toBe(false);
    });
  });

  describe('validateStudentId', () => {
    it('should return true for valid student IDs', () => {
      expect(validateStudentId('STU-12345')).toBe(true);
      expect(validateStudentId('12345')).toBe(true);
      expect(validateStudentId('SU92-BSITM-F22-022')).toBe(true);
    });

    it('should return false for empty or invalid student IDs', () => {
      expect(validateStudentId('')).toBe(false);
      expect(validateStudentId(null)).toBe(false);
      expect(validateStudentId(undefined)).toBe(false);
    });
  });

  describe('validateName', () => {
    it('should return true for valid names (min 2 characters)', () => {
      expect(validateName('John')).toBe(true);
      expect(validateName('Mary Jane')).toBe(true);
      expect(validateName('AB')).toBe(true);
    });

    it('should return false for invalid names', () => {
      expect(validateName('A')).toBe(false);
      expect(validateName('')).toBe(false);
      expect(validateName(null)).toBe(false);
      expect(validateName(undefined)).toBe(false);
    });
  });
});


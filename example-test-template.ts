// Template สำหรับเขียน Test Case ใหม่
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('YourComponent/Function', () => {
  // Mock data หรือ dependencies
  const mockData = {
    // ข้อมูลทดสอบ
  };

  beforeEach(() => {
    // Reset หรือ setup ก่อนแต่ละ test
    vi.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should work correctly with valid input', () => {
      // Arrange
      const input = 'test input';
      
      // Act
      const result = yourFunction(input);
      
      // Assert
      expect(result).toBe('expected output');
    });

    it('should handle edge cases', () => {
      // Test กรณีพิเศษ
      expect(yourFunction('')).toBe('');
      expect(yourFunction(null)).toBe(null);
    });

    it('should throw error for invalid input', () => {
      // Test error cases
      expect(() => yourFunction(invalidInput)).toThrow('Error message');
    });
  });

  describe('Integration Tests', () => {
    it('should work with other components', () => {
      // Test การทำงานร่วมกับ component อื่น
    });
  });

  describe('Mock Tests', () => {
    it('should call external dependencies correctly', () => {
      // Mock external functions
      const mockFn = vi.fn().mockReturnValue('mocked result');
      
      // Test
      const result = yourFunction(mockFn);
      
      // Verify mock was called
      expect(mockFn).toHaveBeenCalledWith('expected params');
      expect(result).toBe('expected result');
    });
  });
});
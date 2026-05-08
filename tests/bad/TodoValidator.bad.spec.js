const TodoValidator = require('../../src/utils/TodoValidator');

describe('TodoValidator - BAD TESTS (Presentation Comparison)', () => {

  // ===================================================================
  // SCENARIO 1: Validating a properly formatted todo
  // ===================================================================
  describe('validates properly formatted todo', () => {
    it('BAD TEST: tests implementation details and internal structure', () => {
      // BAD TEST: This test is coupled to internal validation implementation
      // and tests how validation works rather than what it accomplishes

      const validTodo = {
        title: 'Learn unit testing',
        description: 'Read The Art of Unit Testing book',
        priority: 'high',
        dueDate: '2023-12-31'
      };

      const result = TodoValidator.validate(validTodo);

      // BAD: Testing internal object structure - implementation detail!
      expect(result.hasOwnProperty('isValid')).toBe(true);
      expect(result.hasOwnProperty('errors')).toBe(true);
      expect(Array.isArray(result.errors)).toBe(true);

      // BAD: Testing that errors array is empty by checking its internal structure!
      expect(result.errors.length).toBe(0);
      expect(result.errors.constructor).toBe(Array);

      // BAD: Testing boolean type explicitly - unnecessary implementation detail!
      expect(typeof result.isValid).toBe('boolean');
      expect(result.isValid === true).toBe(true);

      // BAD: Testing that validation doesn't add extra properties - over-specification!
      expect(Object.keys(result)).toEqual(['isValid', 'errors']);
      expect(Object.getOwnPropertyNames(result)).toHaveLength(2);
    });
  });

  // ===================================================================
  // SCENARIO 2: Validation fails for empty title
  // ===================================================================
  describe('validation fails for empty title', () => {
    it('BAD TEST: tests exact error messages and internal validation order', () => {
      // BAD TEST: This test will break if we improve error messages or change validation logic
      // It tests internal implementation rather than validation behavior

      const todoWithEmptyTitle = { title: 'a' }; // valid title to get to trim check
      todoWithEmptyTitle.title = '   '; // whitespace only - will hit trim check

      const result = TodoValidator.validate(todoWithEmptyTitle);

      // BAD: Testing exact error message string - brittle!
      expect(result.errors).toContain('Title cannot be empty');
      expect(result.errors[0]).toBe('Title cannot be empty');

      // BAD: Testing that it doesn't contain other possible valid error messages - over-specification!
      expect(result.errors).not.toContain('Title is missing');
      expect(result.errors).not.toContain('Please provide a title');
      expect(result.errors).not.toContain('Title is required and must be a string');

      // BAD: Testing internal validation logic - that it uses trim() method!
      expect(todoWithEmptyTitle.title.trim()).toBe('');
      expect(todoWithEmptyTitle.title.trim().length).toBe(0);

      // BAD: Testing exact array length - implementation detail!
      expect(result.errors.length).toBe(1);
      expect(result.errors).toHaveLength(1);

      // BAD: Testing boolean type and exact value - over-specification!
      expect(result.isValid).toBe(false);
      expect(result.isValid === false).toBe(true);
    });
  });

  // ===================================================================
  // SCENARIO 3: Validation fails for title exceeding maximum length
  // ===================================================================
  describe('validation fails for title exceeding maximum length', () => {
    it('BAD TEST: tests implementation boundaries and exact error text', () => {
      // BAD TEST: This test is coupled to internal validation constants and exact error wording
      // It will break if we change validation messages or adjust length limits

      const longTitle = 'a'.repeat(201); // Exactly 1 character over limit
      const todoWithLongTitle = { title: longTitle };

      const result = TodoValidator.validate(todoWithLongTitle);

      // BAD: Testing exact error message with specific number - brittle!
      expect(result.errors).toContain('Title cannot exceed 200 characters');
      expect(result.errors[0]).toBe('Title cannot exceed 200 characters');

      // BAD: Testing internal validation constant usage!
      expect(longTitle.length).toBe(201);
      expect(longTitle.length > 200).toBe(true);

      // BAD: Testing that other error formats are not used - over-specification!
      expect(result.errors).not.toContain('Title is too long');
      expect(result.errors).not.toContain('Title exceeds maximum length');
      expect(result.errors).not.toContain(`Title must be under 200 characters`);

      // BAD: Testing exact validation result structure!
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBe(1);
    });
  });

  // ===================================================================
  // SCENARIO 4: Validation fails for invalid priority
  // ===================================================================
  describe('validation fails for invalid priority', () => {
    it('BAD TEST: tests exact validation logic and error message format', () => {
      // BAD TEST: This test is tightly coupled to validation implementation
      // and tests how the validation checks priority values

      const todoWithInvalidPriority = { 
        title: 'Valid title', 
        priority: 'urgent' // Not in allowed list
      };

      const result = TodoValidator.validate(todoWithInvalidPriority);

      // BAD: Testing exact error message including allowed values list - brittle!
      expect(result.errors).toContain('Priority must be one of: low, medium, high');
      
      // BAD: Testing internal validation logic - that it checks against specific array!
      const allowedPriorities = ['low', 'medium', 'high'];
      expect(allowedPriorities.includes('urgent')).toBe(false);
      expect(allowedPriorities).not.toContain('urgent');

      // BAD: Testing that validation uses exact includes() method behavior!
      expect(['low', 'medium', 'high'].includes(todoWithInvalidPriority.priority)).toBe(false);

      // BAD: Testing exact error message format - will break with rewording!
      expect(result.errors[0]).toMatch(/Priority must be one of:/);
      expect(result.errors[0]).toMatch(/low, medium, high/);

      // BAD: Testing validation result structure details!
      expect(result.isValid).toBe(false);
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });

  // ===================================================================
  // SCENARIO 5: Multiple validation errors accumulate
  // ===================================================================
  describe('multiple validation errors accumulate', () => {
    it('BAD TEST: tests exact error order and internal validation sequence', () => {
      // BAD TEST: This massive test verifies internal validation processing order
      // and exact error message accumulation - very brittle!

      const invalidTodo = {
        title: '', // Invalid title - will get "Title is required and must be a string"
        description: 123, // Invalid type  
        priority: 'super-urgent', // Invalid priority
        dueDate: 'not-a-date' // Invalid date
      };

      const result = TodoValidator.validate(invalidTodo);

      // BAD: Testing exact error processing order - implementation detail!
      expect(result.errors[0]).toBe('Title is required and must be a string');
      expect(result.errors[1]).toBe('Description must be a string');
      expect(result.errors[2]).toBe('Priority must be one of: low, medium, high');
      expect(result.errors[3]).toBe('Due date must be a valid date');

      // BAD: Testing exact error count - brittle if we add/remove validations!
      expect(result.errors.length).toBe(4);
      expect(result.errors).toHaveLength(4);

      // BAD: Testing internal validation sequence by verifying each field was processed!
      expect(typeof invalidTodo.title === 'string').toBe(true);
      expect(typeof invalidTodo.description === 'number').toBe(true);
      expect(['low', 'medium', 'high'].includes(invalidTodo.priority)).toBe(false);
      expect(isNaN(new Date(invalidTodo.dueDate).getTime())).toBe(true);

      // BAD: Testing internal object structure!
      expect(result.isValid).toBe(false);
      expect(Object.keys(result)).toEqual(['isValid', 'errors']);
    });
  });

  // ===================================================================
  // SCENARIO 6: Partial update validation (validateForUpdate)
  // ===================================================================
  describe('validates partial updates correctly', () => {
    it('BAD TEST: tests internal update logic and field processing order', () => {
      // BAD TEST: This test is coupled to internal update validation implementation
      // and tests how partial validation works rather than what it achieves

      const partialUpdates = { 
        title: 'Updated title',
        priority: 'high'
      };

      const result = TodoValidator.validateForUpdate(partialUpdates);

      // BAD: Testing that validation processes only provided fields - implementation detail!
      expect(result.errors.length).toBe(0);
      expect(Array.isArray(result.errors)).toBe(true);

      // BAD: Testing internal logic that missing fields are ignored!
      expect(partialUpdates.hasOwnProperty('description')).toBe(false);
      expect(partialUpdates.description).toBeUndefined();

      // BAD: Testing exact validation method behavior for each field!
      expect(typeof partialUpdates.title === 'string').toBe(true);
      expect(partialUpdates.title.length <= 200).toBe(true);
      expect(['low', 'medium', 'high'].includes(partialUpdates.priority)).toBe(true);

      // BAD: Testing internal object structure and properties!
      expect(result.hasOwnProperty('isValid')).toBe(true);
      expect(result.hasOwnProperty('errors')).toBe(true);
      expect(result.isValid === true).toBe(true);

      // BAD: Testing that method doesn't add extra properties - over-specification!
      expect(Object.keys(result)).toEqual(['isValid', 'errors']);
    });
  });
});
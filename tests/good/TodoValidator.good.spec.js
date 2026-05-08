const TodoValidator = require('../../src/utils/TodoValidator');

describe('TodoValidator - GOOD TESTS (Presentation Comparison)', () => {

  // ===================================================================
  // SCENARIO 1: Validating a properly formatted todo
  // ===================================================================
  describe('validates properly formatted todo', () => {
    it('GOOD TEST: behavior-focused validation outcome', () => {
      // GOOD TEST: This test focuses on the validation behavior - does it accept valid input?
      // It will survive internal refactoring because it only tests the outcome

      const validTodo = {
        title: 'Learn unit testing',
        description: 'Read The Art of Unit Testing book',
        priority: 'high',
        dueDate: '2023-12-31'
      };

      const result = TodoValidator.validate(validTodo);

      // GOOD: Testing the behavior outcome - validation should pass
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);

      // GOOD: We don't test internal object structure, property types, or implementation details
      // This allows us to refactor validation logic without breaking tests
    });
  });

  // ===================================================================
  // SCENARIO 2: Validation fails for empty title
  // ===================================================================
  describe('validation fails for empty title', () => {
    it('GOOD TEST: verifies title validation behavior without testing exact messages', () => {
      // GOOD TEST: This test verifies that empty titles are rejected
      // It doesn't depend on exact error message wording

      const todoWithEmptyTitle = { title: '   ' }; // whitespace only

      const result = TodoValidator.validate(todoWithEmptyTitle);

      // GOOD: Testing validation behavior - empty title should be rejected
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);

      // GOOD: Testing that error relates to title without exact message matching
      expect(result.errors.some(error => 
        error.toLowerCase().includes('title')
      )).toBe(true);

      // GOOD: We don't test exact error messages, internal validation logic, or implementation details
      // This allows us to improve error messages without breaking tests
    });
  });

  // ===================================================================
  // SCENARIO 3: Validation fails for title exceeding maximum length
  // ===================================================================
  describe('validation fails for title exceeding maximum length', () => {
    it('GOOD TEST: tests length boundary behavior without coupling to exact limits', () => {
      // GOOD TEST: This test verifies that excessively long titles are rejected
      // It focuses on boundary behavior rather than exact implementation limits

      const veryLongTitle = 'a'.repeat(300); // Clearly too long
      const todoWithLongTitle = { title: veryLongTitle };

      const result = TodoValidator.validate(todoWithLongTitle);

      // GOOD: Testing boundary behavior - very long titles should be rejected
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);

      // GOOD: Testing that error relates to title length without exact message
      expect(result.errors.some(error => {
        const lowerError = error.toLowerCase();
        return (lowerError.includes('title') && 
               (lowerError.includes('long') || lowerError.includes('exceed') || lowerError.includes('200')));
      })).toBe(true);

      // GOOD: We don't test exact character limits, error message format, or validation constants
      // This allows us to adjust limits or improve messages without breaking tests
    });
  });

  // ===================================================================
  // SCENARIO 4: Validation fails for invalid priority
  // ===================================================================
  describe('validation fails for invalid priority', () => {
    it('GOOD TEST: verifies priority validation without testing exact allowed values', () => {
      // GOOD TEST: This test verifies that invalid priorities are rejected
      // It doesn't couple to the specific list of allowed values

      const todoWithInvalidPriority = { 
        title: 'Valid title', 
        priority: 'extremely-urgent' // Clearly not a standard priority
      };

      const result = TodoValidator.validate(todoWithInvalidPriority);

      // GOOD: Testing validation behavior - invalid priority should be rejected
      expect(result.isValid).toBe(false);

      // GOOD: Testing that error relates to priority without exact message matching
      expect(result.errors.some(error => 
        error.toLowerCase().includes('priority')
      )).toBe(true);

      // GOOD: We don't test the exact list of allowed values or error message format
      // This allows us to add new priorities or improve messages without breaking tests
    });

    it('GOOD TEST: accepts all standard priority values', () => {
      // GOOD TEST: This test ensures standard priorities are accepted
      // It tests behavior rather than implementation

      const standardPriorities = ['low', 'medium', 'high'];
      
      standardPriorities.forEach(priority => {
        const todo = { title: 'Test todo', priority };
        const result = TodoValidator.validate(todo);
        
        // GOOD: Each standard priority should be valid
        expect(result.isValid).toBe(true);
      });

      // GOOD: We test that standard values work without coupling to validation logic
    });
  });

  // ===================================================================
  // SCENARIO 5: Multiple validation errors accumulate
  // ===================================================================
  describe('multiple validation errors accumulate', () => {
    it('GOOD TEST: verifies multiple validation failures are handled correctly', () => {
      // GOOD TEST: This test verifies that multiple validation issues are all caught
      // It focuses on behavior rather than exact error processing order

      const invalidTodo = {
        title: '', // Invalid - empty
        priority: 'invalid-priority', // Invalid - not allowed
        dueDate: 'clearly-not-a-date' // Invalid - bad format
      };

      const result = TodoValidator.validate(invalidTodo);

      // GOOD: Testing validation behavior - multiple issues should make it invalid
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);

      // GOOD: Testing that errors cover the main validation concerns without exact order
      const errorText = result.errors.join(' ').toLowerCase();
      expect(errorText).toMatch(/title/);
      expect(errorText).toMatch(/priority/);
      expect(errorText).toMatch(/date/);

      // GOOD: We don't test exact error order, count, or message format
      // This allows us to add/remove validations or reorder them without breaking tests
    });
  });

  // ===================================================================
  // SCENARIO 6: Partial update validation (validateForUpdate)  
  // ===================================================================
  describe('validates partial updates correctly', () => {
    it('GOOD TEST: verifies partial update behavior', () => {
      // GOOD TEST: This test verifies that partial updates work correctly
      // It focuses on the behavior that matters to users

      const partialUpdates = { 
        title: 'Updated title',
        priority: 'high'
      };

      const result = TodoValidator.validateForUpdate(partialUpdates);

      // GOOD: Testing update behavior - valid partial updates should be accepted
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);

      // GOOD: We don't test internal field processing logic or implementation details
      // This allows us to refactor validation logic without breaking the test
    });

    it('GOOD TEST: rejects invalid values in partial updates', () => {
      // GOOD TEST: This test ensures validation still applies to provided fields
      // It tests the important behavior without implementation coupling

      const invalidPartialUpdates = { 
        title: '', // Invalid - empty
        priority: 'invalid' // Invalid - not allowed
      };

      const result = TodoValidator.validateForUpdate(invalidPartialUpdates);

      // GOOD: Testing validation behavior - invalid values should be rejected
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);

      // GOOD: We don't test exact error processing or field-by-field validation logic
    });

    it('GOOD TEST: allows empty updates', () => {
      // GOOD TEST: This test verifies edge case behavior that users might depend on
      
      const emptyUpdates = {};

      const result = TodoValidator.validateForUpdate(emptyUpdates);

      // GOOD: Testing edge case behavior - empty updates should be allowed
      expect(result.isValid).toBe(true);

      // GOOD: This tests a business rule that matters to API consumers
    });
  });

  // ===================================================================
  // ADDITIONAL GOOD TESTS: Edge cases and boundary conditions
  // ===================================================================
  describe('handles edge cases correctly', () => {
    it('GOOD TEST: accepts title at maximum allowed length', () => {
      // GOOD TEST: Testing boundary condition behavior
      
      const maxLengthTitle = 'a'.repeat(200); // At the boundary
      const todo = { title: maxLengthTitle };

      const result = TodoValidator.validate(todo);

      // GOOD: Boundary value should be accepted
      expect(result.isValid).toBe(true);
    });

    it('GOOD TEST: handles null and undefined input gracefully', () => {
      // GOOD TEST: Testing error handling behavior
      
      expect(TodoValidator.validate(null).isValid).toBe(false);
      expect(TodoValidator.validate(undefined).isValid).toBe(false);

      // GOOD: Both should be handled without crashing
    });

    it('GOOD TEST: accepts optional fields when not provided', () => {
      // GOOD TEST: Testing that optional fields truly are optional
      
      const minimalTodo = { title: 'Just a title' };

      const result = TodoValidator.validate(minimalTodo);

      // GOOD: Minimal valid input should be accepted
      expect(result.isValid).toBe(true);
    });

    it('GOOD TEST: validates date format flexibility', () => {
      // GOOD TEST: Testing that reasonable date formats are accepted
      
      const dateFormats = [
        '2023-12-31',
        '2023-12-31T23:59:59Z',
        'Dec 31, 2023'
      ];

      dateFormats.forEach(dateFormat => {
        const todo = { title: 'Test', dueDate: dateFormat };
        const result = TodoValidator.validate(todo);
        
        // GOOD: Standard date formats should work
        expect(result.isValid).toBe(true);
      });
    });
  });
});
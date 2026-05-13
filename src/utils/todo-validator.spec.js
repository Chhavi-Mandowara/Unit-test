const TodoValidator = require('./todo-validator');

/**
 * One `describe` per feature. Back-to-back: `@bad` then `@good` (same scenario, different assertion style).
 * Titles name **one scenario**; several `expect`s can still describe facets of that single outcome.
 * `// WHY THIS IS BAD` / `// WHY THIS IS GOOD` explain assertion style, not the scenario name.
 *
 * npm run test:bad  → jest --testNamePattern "@bad"
 * npm run test:good → jest --testNamePattern "@good"
 */
describe('todo-validator', () => {
  describe('validate() — properly formatted todo', () => {
    it('@bad should mark a well-formed todo payload as valid', () => {
      // WHY THIS IS BAD: Only the outcome matters: “valid” and no errors. Asserting hasOwnProperty,
      // key order, and Array constructor tests JavaScript mechanics and your DTO shape — not the rule.

      const validTodo = {
        title: 'Learn unit testing',
        description: 'Read The Art of Unit Testing book',
        priority: 'high',
        dueDate: '2023-12-31'
      };

      const result = TodoValidator.validate(validTodo);

      expect(result.hasOwnProperty('isValid')).toBe(true);
      expect(result.hasOwnProperty('errors')).toBe(true);
      expect(Array.isArray(result.errors)).toBe(true);
      expect(result.errors.length).toBe(0);
      expect(result.errors.constructor).toBe(Array);
      expect(typeof result.isValid).toBe('boolean');
      expect(result.isValid === true).toBe(true);
      expect(Object.keys(result)).toEqual(['isValid', 'errors']);
      expect(Object.getOwnPropertyNames(result)).toHaveLength(2);
    });

    it('@good should mark a well-formed todo payload as valid', () => {
      // WHY THIS IS GOOD: Two expectations capture the behavior. If you later return extra metadata or
      // use a different errors collection type, the test still passes as long as validation meaning holds.

      const validTodo = {
        title: 'Learn unit testing',
        description: 'Read The Art of Unit Testing book',
        priority: 'high',
        dueDate: '2023-12-31'
      };

      const result = TodoValidator.validate(validTodo);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validate() — empty / whitespace title', () => {
    it('@bad should reject a todo whose title is only whitespace', () => {
      // WHY THIS IS BAD: Marketing/legal might reword “Title cannot be empty.” The test should care that
      // title failed, not the exact phrase. Re-testing trim() duplicates production logic in the test.

      const todoWithEmptyTitle = { title: 'a' };
      todoWithEmptyTitle.title = '   ';

      const result = TodoValidator.validate(todoWithEmptyTitle);

      expect(result.errors).toContain('Title cannot be empty');
      expect(result.errors[0]).toBe('Title cannot be empty');
      expect(result.errors).not.toContain('Title is missing');
      expect(result.errors).not.toContain('Please provide a title');
      expect(result.errors).not.toContain('Title is required and must be a string');
      expect(todoWithEmptyTitle.title.trim()).toBe('');
      expect(todoWithEmptyTitle.title.trim().length).toBe(0);
      expect(result.errors.length).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.isValid).toBe(false);
      expect(result.isValid === false).toBe(true);
    });

    it('@good should reject a todo whose title is only whitespace', () => {
      // WHY THIS IS GOOD: Flexible matcher on “title” in any message — survives copy changes while still
      // catching the wrong class of bug (e.g. silently accepting blank titles).

      const todoWithEmptyTitle = { title: '   ' };

      const result = TodoValidator.validate(todoWithEmptyTitle);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(error => error.toLowerCase().includes('title'))).toBe(true);
    });
  });

  describe('validate() — invalid priority', () => {
    it('@bad should reject a todo when priority is not one of the allowed values', () => {
      // WHY THIS IS BAD: The test re-implements the validator’s allow-list in expect(). That is testing
      // your test, not the app. Regex on the full sentence breaks when translators touch copy.

      const todoWithInvalidPriority = {
        title: 'Valid title',
        priority: 'urgent'
      };

      const result = TodoValidator.validate(todoWithInvalidPriority);

      expect(result.errors).toContain('Priority must be one of: low, medium, high');
      const allowedPriorities = ['low', 'medium', 'high'];
      expect(allowedPriorities.includes('urgent')).toBe(false);
      expect(allowedPriorities).not.toContain('urgent');
      expect(['low', 'medium', 'high'].includes(todoWithInvalidPriority.priority)).toBe(false);
      expect(result.errors[0]).toMatch(/Priority must be one of:/);
      expect(result.errors[0]).toMatch(/low, medium, high/);
      expect(result.isValid).toBe(false);
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('@good should reject a todo when priority is not one of the allowed values', () => {
      // WHY THIS IS GOOD: One invalid example + semantic check on “priority.” Adding a new allowed value
      // in code does not require updating this test’s expectations.

      const todoWithInvalidPriority = {
        title: 'Valid title',
        priority: 'extremely-urgent'
      };

      const result = TodoValidator.validate(todoWithInvalidPriority);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.toLowerCase().includes('priority'))).toBe(true);
    });
  });

  describe('validate() — multiple validation errors', () => {
    it('@bad should reject a todo payload that violates several rules at once', () => {
      // WHY THIS IS BAD: Order of errors is an implementation detail unless the product guarantees it.
      // Re-stating typeof checks duplicates validation logic instead of trusting the outcome.

      const invalidTodo = {
        title: '',
        description: 123,
        priority: 'super-urgent',
        dueDate: 'not-a-date'
      };

      const result = TodoValidator.validate(invalidTodo);

      expect(result.errors[0]).toBe('Title is required and must be a string');
      expect(result.errors[1]).toBe('Description must be a string');
      expect(result.errors[2]).toBe('Priority must be one of: low, medium, high');
      expect(result.errors[3]).toBe('Due date must be a valid date');
      expect(result.errors.length).toBe(4);
      expect(result.errors).toHaveLength(4);
      expect(typeof invalidTodo.title === 'string').toBe(true);
      expect(typeof invalidTodo.description === 'number').toBe(true);
      expect(['low', 'medium', 'high'].includes(invalidTodo.priority)).toBe(false);
      expect(isNaN(new Date(invalidTodo.dueDate).getTime())).toBe(true);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result)).toEqual(['isValid', 'errors']);
    });

    it('@good should reject a todo payload that violates several rules at once', () => {
      // WHY THIS IS GOOD: Confirms multiple problems surface together without dictating order or exact
      // strings — good regression guard when adding/removing rules.

      const invalidTodo = {
        title: '',
        priority: 'invalid-priority',
        dueDate: 'clearly-not-a-date'
      };

      const result = TodoValidator.validate(invalidTodo);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      const errorText = result.errors.join(' ').toLowerCase();
      expect(errorText).toMatch(/title/);
      expect(errorText).toMatch(/priority/);
      expect(errorText).toMatch(/date/);
    });
  });

  describe('validateForUpdate() — partial updates', () => {
    it('@bad should accept a partial update that changes only title and priority', () => {
      // WHY THIS IS BAD: Peeks at which fields were “missing” on the update object and duplicates string
      // length checks the validator already performs. Brittle if you allow optional metadata on result.

      const partialUpdates = {
        title: 'Updated title',
        priority: 'high'
      };

      const result = TodoValidator.validateForUpdate(partialUpdates);

      expect(result.errors.length).toBe(0);
      expect(Array.isArray(result.errors)).toBe(true);
      expect(partialUpdates.hasOwnProperty('description')).toBe(false);
      expect(partialUpdates.description).toBeUndefined();
      expect(typeof partialUpdates.title === 'string').toBe(true);
      expect(partialUpdates.title.length <= 200).toBe(true);
      expect(['low', 'medium', 'high'].includes(partialUpdates.priority)).toBe(true);
      expect(result.hasOwnProperty('isValid')).toBe(true);
      expect(result.hasOwnProperty('errors')).toBe(true);
      expect(result.isValid === true).toBe(true);
      expect(Object.keys(result)).toEqual(['isValid', 'errors']);
    });

    it('@good should accept a partial update that changes only title and priority', () => {
      // WHY THIS IS GOOD: Straight behavior: valid patch → valid. No inspection of internal field rules.

      const partialUpdates = { title: 'Updated title', priority: 'high' };
      const result = TodoValidator.validateForUpdate(partialUpdates);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('@good should reject a partial update when title and priority are invalid', () => {
      // WHY THIS IS GOOD: Focused negative case — invalid partial data should fail without coupling to
      // each field’s message text.

      const invalidPartialUpdates = { title: '', priority: 'invalid' };
      const result = TodoValidator.validateForUpdate(invalidPartialUpdates);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validate() — edge cases', () => {
    it('@good should accept a title whose length equals the maximum allowed length', () => {
      // WHY THIS IS GOOD: Boundary value on the rule itself — fails only if the max-length policy regresses.

      const todo = { title: 'a'.repeat(200) };
      expect(TodoValidator.validate(todo).isValid).toBe(true);
    });

    it('@good should not throw when validate receives null or undefined', () => {
      // WHY THIS IS GOOD: Robustness check — public API should not explode on garbage input.

      expect(TodoValidator.validate(null).isValid).toBe(false);
      expect(TodoValidator.validate(undefined).isValid).toBe(false);
    });

  });
});

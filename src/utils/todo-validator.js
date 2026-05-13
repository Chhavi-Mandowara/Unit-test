/**
 * Todo validation utilities
 */
class TodoValidator {
  static validate(todo) {
    const errors = [];

    if (!todo) {
      errors.push('Todo object is required');
      return { isValid: false, errors };
    }

    if (!todo.title || typeof todo.title !== 'string') {
      errors.push('Title is required and must be a string');
    } else if (todo.title.trim().length === 0) {
      errors.push('Title cannot be empty');
    } else if (todo.title.length > 200) {
      errors.push('Title cannot exceed 200 characters');
    }

    if (todo.description && typeof todo.description !== 'string') {
      errors.push('Description must be a string');
    } else if (todo.description && todo.description.length > 1000) {
      errors.push('Description cannot exceed 1000 characters');
    }

    if (todo.priority && !['low', 'medium', 'high'].includes(todo.priority)) {
      errors.push('Priority must be one of: low, medium, high');
    }

    if (todo.dueDate) {
      const dueDate = new Date(todo.dueDate);
      if (isNaN(dueDate.getTime())) {
        errors.push('Due date must be a valid date');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateForUpdate(todo) {
    if (!todo) {
      return { isValid: false, errors: ['Todo object is required'] };
    }

    const errors = [];

    if (todo.title !== undefined) {
      if (typeof todo.title !== 'string' || todo.title.trim().length === 0) {
        errors.push('Title must be a non-empty string');
      } else if (todo.title.length > 200) {
        errors.push('Title cannot exceed 200 characters');
      }
    }

    if (todo.description !== undefined && typeof todo.description !== 'string') {
      errors.push('Description must be a string');
    }

    if (todo.priority !== undefined && !['low', 'medium', 'high'].includes(todo.priority)) {
      errors.push('Priority must be one of: low, medium, high');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = TodoValidator;

const TodoValidator = require('../utils/TodoValidator');

/**
 * REFACTORED TodoService - This version shows harmless internal changes
 * that will break bad tests but not affect good tests
 * 
 * Changes made:
 * 1. Extracted validation to private method
 * 2. Reordered analytics and notification calls
 * 3. Changed logging order
 * 4. Added internal caching (implementation detail)
 */
class TodoService {
  constructor(todoRepository, notificationService, analyticsService, logger, clock) {
    this.todoRepository = todoRepository;
    this.notificationService = notificationService;
    this.analyticsService = analyticsService;
    this.logger = logger;
    this.clock = clock;
    // NEW: Added internal cache (implementation detail)
    this.lastCreatedTodo = null;
  }

  async createTodo(todoData) {
    // REFACTOR: Changed log message (will break exact string assertions)
    this.logger.info('Starting todo creation process', { title: todoData.title });

    // REFACTOR: Extracted to private method (implementation change)
    this._validateTodoData(todoData);

    try {
      // Create todo object
      const todo = {
        ...todoData,
        status: 'pending',
        createdAt: this.clock.now().toISOString(),
        updatedAt: this.clock.now().toISOString()
      };

      // Save to repository
      const savedTodo = await this.todoRepository.save(todo);

      // REFACTOR: Do analytics BEFORE notification (reordered operations)
      this.analyticsService.track('todo_created', {
        todoId: savedTodo.id,
        priority: savedTodo.priority || 'medium',
        hasDueDate: !!savedTodo.dueDate
      });

      // Send notification if due date is set (moved after analytics)
      if (savedTodo.dueDate && savedTodo.userEmail) {
        await this._scheduleReminder(savedTodo);
      }

      // NEW: Cache the created todo (implementation detail)
      this.lastCreatedTodo = { ...savedTodo };

      // REFACTOR: Changed success log message (will break exact string assertions)
      this.logger.info('Todo creation process completed', { todoId: savedTodo.id });
      
      return savedTodo;

    } catch (error) {
      this.logger.error('Failed to create todo', error, { todoData });
      throw error;
    }
  }

  // REFACTOR: Extracted validation to private method (implementation change)
  _validateTodoData(todoData) {
    const validation = TodoValidator.validate(todoData);
    if (!validation.isValid) {
      this.logger.error('Todo validation failed', null, { errors: validation.errors });
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
  }

  // NEW: Getter for cached todo (implementation detail)
  getLastCreatedTodo() {
    return this.lastCreatedTodo ? { ...this.lastCreatedTodo } : null;
  }

  async completeTodo(todoId, userEmail) {
    this.logger.info('Completing todo', { todoId });

    try {
      const todo = await this.todoRepository.findById(todoId);
      if (!todo) {
        throw new Error(`Todo with id ${todoId} not found`);
      }

      if (todo.status === 'completed') {
        this.logger.warn('Attempting to complete already completed todo', { todoId });
        return todo;
      }

      // Update status
      const updatedTodo = await this.todoRepository.save({
        ...todo,
        status: 'completed',
        completedAt: this.clock.now().toISOString(),
        updatedAt: this.clock.now().toISOString()
      });

      // REFACTOR: Changed order - analytics before notification
      this.analyticsService.track('todo_completed', {
        todoId: updatedTodo.id,
        timeToComplete: this._calculateCompletionTime(updatedTodo)
      });

      // Send completion notification
      if (userEmail) {
        await this.notificationService.sendReminder(
          `Great job! You completed: ${updatedTodo.title}`, 
          userEmail
        );
      }

      this.logger.info('Todo completed successfully', { todoId: updatedTodo.id });
      return updatedTodo;

    } catch (error) {
      this.logger.error('Failed to complete todo', error, { todoId });
      throw error;
    }
  }

  async deleteTodo(todoId) {
    this.logger.info('Deleting todo', { todoId });

    try {
      const todo = await this.todoRepository.findById(todoId);
      if (!todo) {
        throw new Error(`Todo with id ${todoId} not found`);
      }

      // REFACTOR: Analytics BEFORE deletion (changed order - will break sequence tests)
      this.analyticsService.track('todo_deleted', {
        todoId,
        wasCompleted: todo.status === 'completed'
      });

      const deleted = await this.todoRepository.delete(todoId);
      
      if (deleted) {
        // REFACTOR: Success log moved after analytics (different order)
        this.logger.info('Todo deleted successfully', { todoId });
      }

      return deleted;

    } catch (error) {
      this.logger.error('Failed to delete todo', error, { todoId });
      throw error;
    }
  }

  async listTodos(status = null) {
    this.logger.info('Listing todos', { status });

    try {
      const todos = status 
        ? await this.todoRepository.findByStatus(status)
        : await this.todoRepository.findAll();

      this.analyticsService.track('todos_listed', {
        status,
        count: todos.length
      });

      return todos;

    } catch (error) {
      this.logger.error('Failed to list todos', error, { status });
      throw error;
    }
  }

  async updateTodo(todoId, updates) {
    this.logger.info('Updating todo', { todoId, updates });

    // REFACTOR: Use extracted validation method
    this._validateUpdateData(updates);

    try {
      const existingTodo = await this.todoRepository.findById(todoId);
      if (!existingTodo) {
        throw new Error(`Todo with id ${todoId} not found`);
      }

      const updatedTodo = await this.todoRepository.save({
        ...existingTodo,
        ...updates,
        updatedAt: this.clock.now().toISOString()
      });

      this.analyticsService.track('todo_updated', {
        todoId: updatedTodo.id,
        updatedFields: Object.keys(updates)
      });

      this.logger.info('Todo updated successfully', { todoId: updatedTodo.id });
      return updatedTodo;

    } catch (error) {
      this.logger.error('Failed to update todo', error, { todoId, updates });
      throw error;
    }
  }

  // REFACTOR: Extracted update validation (implementation change)
  _validateUpdateData(updates) {
    const validation = TodoValidator.validateForUpdate(updates);
    if (!validation.isValid) {
      this.logger.error('Todo update validation failed', null, { errors: validation.errors });
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
  }

  async sendDailyDigest(userEmail) {
    this.logger.info('Sending daily digest', { userEmail });

    try {
      const todoCount = await this.todoRepository.count();
      const pendingTodos = await this.todoRepository.findByStatus('pending');

      // REFACTOR: Analytics before notification (changed order)
      this.analyticsService.track('daily_digest_sent', {
        userEmail,
        totalTodos: todoCount,
        pendingTodos: pendingTodos.length
      });

      await this.notificationService.sendDailyDigest(userEmail, todoCount);

      return {
        totalTodos: todoCount,
        pendingTodos: pendingTodos.length,
        sentAt: this.clock.now().toISOString()
      };

    } catch (error) {
      this.logger.error('Failed to send daily digest', error, { userEmail });
      throw error;
    }
  }

  // Private helper methods (unchanged)
  async _scheduleReminder(todo) {
    await this.notificationService.sendReminder(
      `Reminder: ${todo.title} is due soon!`, 
      todo.userEmail
    );
  }

  _calculateCompletionTime(todo) {
    if (!todo.createdAt || !todo.completedAt) return null;
    
    const created = new Date(todo.createdAt);
    const completed = new Date(todo.completedAt);
    return completed.getTime() - created.getTime();
  }
}

module.exports = TodoService;
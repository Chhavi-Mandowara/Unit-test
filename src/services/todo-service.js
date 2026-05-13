const TodoValidator = require('../utils/todo-validator');

/**
 * Main TodoService that orchestrates todo operations
 * This service demonstrates realistic dependencies for testing scenarios
 */
class TodoService {
  constructor(todoRepository, notificationService, analyticsService, logger, clock) {
    this.todoRepository = todoRepository;
    this.notificationService = notificationService;
    this.analyticsService = analyticsService;
    this.logger = logger;
    this.clock = clock;
  }

  async createTodo(todoData) {
    this.logger.info('Creating new todo', { title: todoData.title });

    const validation = TodoValidator.validate(todoData);
    if (!validation.isValid) {
      this.logger.error('Todo validation failed', null, { errors: validation.errors });
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    try {
      const todo = {
        ...todoData,
        status: 'pending',
        createdAt: this.clock.now().toISOString(),
        updatedAt: this.clock.now().toISOString()
      };
      // const at = this.clock.now().toISOString();
      // const todo = {
      //   ...todoData,
      //   status: 'pending',
      //   createdAt: at,
      //   updatedAt: at
      // };


      const savedTodo = await this.todoRepository.save(todo);

      this.analyticsService.track('todo_created', {
        todoId: savedTodo.id,
        priority: savedTodo.priority || 'medium',
        hasDueDate: !!savedTodo.dueDate
      });

      if (savedTodo.dueDate && savedTodo.userEmail) {
        await this._scheduleReminder(savedTodo);
      }

      this.logger.info('Todo created successfully', { todoId: savedTodo.id });
      return savedTodo;
    } catch (error) {
      this.logger.error('Failed to create todo', error, { todoData });
      throw error;
    }
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

      const updatedTodo = await this.todoRepository.save({
        ...todo,
        status: 'completed',
        completedAt: this.clock.now().toISOString(),
        updatedAt: this.clock.now().toISOString()
      });

      this.analyticsService.track('todo_completed', {
        todoId: updatedTodo.id,
        timeToComplete: this._calculateCompletionTime(updatedTodo)
      });

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

      const deleted = await this.todoRepository.delete(todoId);

      if (deleted) {
        this.analyticsService.track('todo_deleted', {
          todoId,
          wasCompleted: todo.status === 'completed'
        });

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

    const validation = TodoValidator.validateForUpdate(updates);
    if (!validation.isValid) {
      this.logger.error('Todo update validation failed', null, { errors: validation.errors });
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

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

  async sendDailyDigest(userEmail) {
    this.logger.info('Sending daily digest', { userEmail });

    //swap here
    try {
      const todoCount = await this.todoRepository.count();
      const pendingTodos = await this.todoRepository.findByStatus('pending');

      await this.notificationService.sendDailyDigest(userEmail, todoCount);

      this.analyticsService.track('daily_digest_sent', {
        userEmail,
        totalTodos: todoCount,
        pendingTodos: pendingTodos.length
      });

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

const TodoService = require('../../src/services/TodoService');

describe('TodoService - BAD TESTS (Presentation Comparison)', () => {
  let todoService;
  let mockRepository;
  let mockNotificationService;
  let mockAnalyticsService;
  let mockLogger;
  let mockClock;

  beforeEach(() => {
    // BAD: Over-mocking - creating mocks for every dependency even when not needed
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByStatus: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    };

    mockNotificationService = {
      sendReminder: jest.fn(),
      sendDailyDigest: jest.fn(),
      getSentNotifications: jest.fn(),
      clear: jest.fn()
    };

    mockAnalyticsService = {
      track: jest.fn(),
      getEvents: jest.fn(),
      clear: jest.fn(),
      _sendToAnalyticsPlatform: jest.fn(),
      _getSessionId: jest.fn()
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      getLogs: jest.fn(),
      clear: jest.fn()
    };

    mockClock = {
      now: jest.fn().mockReturnValue(new Date('2023-01-01T12:00:00Z')),
      timestamp: jest.fn()
    };

    todoService = new TodoService(
      mockRepository,
      mockNotificationService,
      mockAnalyticsService,
      mockLogger,
      mockClock
    );
  });

  // ===================================================================
  // SCENARIO 1: Creating a todo successfully
  // ===================================================================
  describe('creates todo successfully', () => {
    it('BAD TEST: tightly coupled to implementation details', async () => {
      // BAD TEST: This test is fragile because it tests HOW instead of WHAT
      // It will break if we change internal implementation, logging, or call order

      const todoData = { title: 'Learn Jest', userEmail: 'user@test.com' };
      const savedTodo = {
        id: 1,
        title: 'Learn Jest',
        userEmail: 'user@test.com',
        status: 'pending',
        createdAt: '2023-01-01T12:00:00.000Z',
        updatedAt: '2023-01-01T12:00:00.000Z'
      };
      
      mockRepository.save.mockResolvedValue(savedTodo);

      const result = await todoService.createTodo(todoData);

      // BAD: Testing exact internal method calls and order - implementation details!
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
      expect(mockLogger.info).toHaveBeenNthCalledWith(1, 
        'Creating new todo', { title: 'Learn Jest' });
      expect(mockLogger.info).toHaveBeenNthCalledWith(2, 
        'Todo created successfully', { todoId: 1 });

      // BAD: Verifying exact object structure passed to repository - internal detail!
      expect(mockRepository.save).toHaveBeenCalledWith({
        title: 'Learn Jest',
        userEmail: 'user@test.com',
        status: 'pending',
        createdAt: '2023-01-01T12:00:00.000Z',
        updatedAt: '2023-01-01T12:00:00.000Z'
      });

      // BAD: Testing analytics call structure - too detailed!
      expect(mockAnalyticsService.track).toHaveBeenCalledWith('todo_created', {
        todoId: 1,
        priority: 'medium',
        hasDueDate: false
      });

      // BAD: Verifying clock usage - internal implementation detail!
      expect(mockClock.now).toHaveBeenCalledTimes(2);

      // BAD: Testing that notification was NOT called - over-specification!
      expect(mockNotificationService.sendReminder).not.toHaveBeenCalled();

      // Finally testing the actual result (this part is fine)
      expect(result).toEqual(savedTodo);
    });
  });

  // ===================================================================
  // SCENARIO 2: Completing a todo successfully
  // ===================================================================
  describe('completes todo successfully', () => {
    it('BAD TEST: over-mocking with unnecessary interaction verification', async () => {
      // BAD TEST: This test mocks and verifies every possible interaction
      // Making it brittle and testing implementation instead of behavior

      const existingTodo = {
        id: 1,
        title: 'Learn testing',
        status: 'pending',
        createdAt: '2023-01-01T10:00:00.000Z'
      };

      const completedTodo = {
        ...existingTodo,
        status: 'completed',
        completedAt: '2023-01-01T12:00:00.000Z',
        updatedAt: '2023-01-01T12:00:00.000Z'
      };

      mockRepository.findById.mockResolvedValue(existingTodo);
      mockRepository.save.mockResolvedValue(completedTodo);

      const result = await todoService.completeTodo(1, 'user@test.com');

      // BAD: Verifying every single mock interaction - over-testing!
      expect(mockRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
      expect(mockAnalyticsService.track).toHaveBeenCalledTimes(1);
      expect(mockNotificationService.sendReminder).toHaveBeenCalledTimes(1);
      expect(mockClock.now).toHaveBeenCalledTimes(2);

      // BAD: Testing exact log message strings - will break if wording changes!
      expect(mockLogger.info).toHaveBeenCalledWith('Completing todo', { todoId: 1 });
      expect(mockLogger.info).toHaveBeenCalledWith('Todo completed successfully', { todoId: 1 });

      // BAD: Testing exact analytics payload - internal implementation!
      expect(mockAnalyticsService.track).toHaveBeenCalledWith('todo_completed', {
        todoId: 1,
        timeToComplete: 7200000 // This tests private calculation logic!
      });

      // BAD: Testing exact notification call - implementation detail!
      expect(mockNotificationService.sendReminder).toHaveBeenCalledWith(
        'Great job! You completed: Learn testing',
        'user@test.com'
      );

      // Finally testing the result (this is good)
      expect(result.status).toBe('completed');
    });
  });

  // ===================================================================
  // SCENARIO 3: Sending reminder notification for todo with due date
  // ===================================================================
  describe('sends reminder notification for todo with due date', () => {
    it('BAD TEST: tests exact logger strings and notification message format', async () => {
      // BAD TEST: This test is brittle because it tests exact message formatting
      // and internal logging behavior instead of just verifying the reminder was sent

      const todoData = { 
        title: 'Important Meeting', 
        userEmail: 'user@test.com',
        dueDate: '2023-12-31' 
      };
      
      const savedTodo = { 
        id: 1, 
        ...todoData, 
        status: 'pending',
        createdAt: '2023-01-01T12:00:00.000Z',
        updatedAt: '2023-01-01T12:00:00.000Z'
      };
      
      mockRepository.save.mockResolvedValue(savedTodo);

      await todoService.createTodo(todoData);

      // BAD: Testing exact log message format - will break if we improve wording!
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Creating new todo', 
        { title: 'Important Meeting' }
      );

      // BAD: Testing exact notification message format - brittle!
      expect(mockNotificationService.sendReminder).toHaveBeenCalledWith(
        'Reminder: Important Meeting is due soon!',
        'user@test.com'
      );

      // BAD: Verifying analytics call structure - implementation testing!
      expect(mockAnalyticsService.track).toHaveBeenCalledWith('todo_created', {
        todoId: 1,
        priority: 'medium',
        hasDueDate: true
      });

      // BAD: Testing internal method call order - fragile!
      expect(mockRepository.save).toHaveBeenCalledBefore(mockNotificationService.sendReminder);
    });
  });

  // ===================================================================
  // SCENARIO 4: Validation failure when creating todo
  // ===================================================================
  describe('handles validation failure when creating todo', () => {
    it('BAD TEST: god test that verifies everything at once', async () => {
      // BAD TEST: This massive test tries to verify validation, logging, 
      // error handling, and ensures no side effects all in one test
      // Making it hard to understand what specifically failed

      const invalidTodo = { title: '' }; // Empty title should fail

      try {
        await todoService.createTodo(invalidTodo);
        fail('Should have thrown validation error');
      } catch (error) {
        // BAD: Testing exact error message string - brittle!
        expect(error.message).toBe('Validation failed: Title is required and must be a string');

        // BAD: Testing exact logging behavior during error - implementation detail!
        expect(mockLogger.info).toHaveBeenCalledWith('Creating new todo', { title: '' });
        expect(mockLogger.error).toHaveBeenCalledWith(
          'Todo validation failed', 
          null, 
          { errors: ['Title is required and must be a string'] }
        );

        // BAD: Verifying that NO side effects happened - over-specification!
        expect(mockRepository.save).not.toHaveBeenCalled();
        expect(mockAnalyticsService.track).not.toHaveBeenCalled();
        expect(mockNotificationService.sendReminder).not.toHaveBeenCalled();
        expect(mockClock.now).not.toHaveBeenCalled();

        // BAD: Testing that logger was called before error was thrown - call order testing!
        expect(mockLogger.info).toHaveBeenCalledBefore(mockLogger.error);
      }
    });
  });

  // ===================================================================
  // SCENARIO 5: Repository failure during todo creation
  // ===================================================================
  describe('handles repository failure during todo creation', () => {
    it('BAD TEST: tests transaction internals and exact error logging', async () => {
      // BAD TEST: This test is coupled to internal error handling implementation
      // and will break if we change how we handle or log database errors

      const todoData = { title: 'Valid Todo' };
      const dbError = new Error('Database connection failed');
      
      mockRepository.save.mockRejectedValue(dbError);

      try {
        await todoService.createTodo(todoData);
        fail('Should have thrown database error');
      } catch (error) {
        // BAD: Testing that the exact same error object is re-thrown - implementation detail!
        expect(error).toBe(dbError);

        // BAD: Verifying exact error logging format - fragile!
        expect(mockLogger.error).toHaveBeenCalledWith(
          'Failed to create todo',
          dbError,
          { todoData }
        );

        // BAD: Testing that info log happened before error - call order dependency!
        expect(mockLogger.info).toHaveBeenCalledWith('Creating new todo', { title: 'Valid Todo' });

        // BAD: Verifying that cleanup/rollback logic was called - testing internals!
        expect(mockAnalyticsService.track).not.toHaveBeenCalled();
        expect(mockNotificationService.sendReminder).not.toHaveBeenCalled();

        // BAD: Testing exact sequence of operations before failure - brittle!
        expect(mockRepository.save).toHaveBeenCalledAfter(mockLogger.info);
      }
    });
  });

  // ===================================================================
  // SCENARIO 6: Deleting a completed todo
  // ===================================================================
  describe('deletes a completed todo', () => {
    it('BAD TEST: fragile test that breaks after harmless refactoring', async () => {
      // BAD TEST: This test will break when we make harmless internal changes
      // like reordering operations or changing log messages

      const completedTodo = { 
        id: 1, 
        title: 'Completed Task', 
        status: 'completed' 
      };
      
      mockRepository.findById.mockResolvedValue(completedTodo);
      mockRepository.delete.mockResolvedValue(true);

      const result = await todoService.deleteTodo(1);

      // BAD: Testing exact method call sequence - will break if we reorder operations!
      expect(mockLogger.info).toHaveBeenNthCalledWith(1, 'Deleting todo', { todoId: 1 });
      expect(mockRepository.findById).toHaveBeenCalledAfter(mockLogger.info);
      expect(mockRepository.delete).toHaveBeenCalledAfter(mockRepository.findById);
      expect(mockAnalyticsService.track).toHaveBeenCalledAfter(mockRepository.delete);
      expect(mockLogger.info).toHaveBeenNthCalledWith(2, 'Todo deleted successfully', { todoId: 1 });

      // BAD: Testing exact analytics payload structure - internal implementation!
      expect(mockAnalyticsService.track).toHaveBeenCalledWith('todo_deleted', {
        todoId: 1,
        wasCompleted: true
      });

      // Finally, testing the actual result (this is fine)
      expect(result).toBe(true);
    });
  });
});

// Helper function for call order testing (Jest doesn't have toHaveBeenCalledBefore)
expect.extend({
  toHaveBeenCalledBefore(received, expected) {
    const receivedCallOrder = received.mock.invocationCallOrder[0];
    const expectedCallOrder = expected.mock.invocationCallOrder[0];
    
    if (receivedCallOrder < expectedCallOrder) {
      return { pass: true, message: () => 'Expected mock to be called before other mock' };
    }
    return { pass: false, message: () => 'Expected mock to be called before other mock' };
  },
  
  toHaveBeenCalledAfter(received, expected) {
    const receivedCallOrder = received.mock.invocationCallOrder[0];
    const expectedCallOrder = expected.mock.invocationCallOrder[0];
    
    if (receivedCallOrder > expectedCallOrder) {
      return { pass: true, message: () => 'Expected mock to be called after other mock' };
    }
    return { pass: false, message: () => 'Expected mock to be called after other mock' };
  }
});
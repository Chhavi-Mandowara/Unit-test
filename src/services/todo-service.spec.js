const TodoService = require('./todo-service');

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

describe('todo-service', () => {
  function createWithBadMocks() {
    const mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByStatus: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    };
    const mockNotificationService = {
      sendReminder: jest.fn(),
      sendDailyDigest: jest.fn(),
      getSentNotifications: jest.fn(),
      clear: jest.fn()
    };
    const mockAnalyticsService = {
      track: jest.fn(),
      getEvents: jest.fn(),
      clear: jest.fn(),
      _sendToAnalyticsPlatform: jest.fn(),
      _getSessionId: jest.fn()
    };
    const mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      getLogs: jest.fn(),
      clear: jest.fn()
    };
    const mockClock = {
      now: jest.fn().mockReturnValue(new Date('2023-01-01T12:00:00Z')),
      timestamp: jest.fn()
    };
    const todoService = new TodoService(
      mockRepository,
      mockNotificationService,
      mockAnalyticsService,
      mockLogger,
      mockClock
    );
    return {
      todoService,
      mockRepository,
      mockNotificationService,
      mockAnalyticsService,
      mockLogger,
      mockClock
    };
  }

  function createWithGoodMocks() {
    const stubRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByStatus: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    };
    const mockNotificationService = {
      sendReminder: jest.fn(),
      sendDailyDigest: jest.fn()
    };
    const mockAnalyticsService = { track: jest.fn() };
    const stubLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn()
    };
    const stubClock = {
      now: jest.fn().mockReturnValue(new Date('2023-01-01T12:00:00Z'))
    };
    const todoService = new TodoService(
      stubRepository,
      mockNotificationService,
      mockAnalyticsService,
      stubLogger,
      stubClock
    );
    return {
      todoService,
      stubRepository,
      mockNotificationService,
      mockAnalyticsService,
      stubLogger,
      stubClock
    };
  }

  describe('createTodo', () => {
    it('@bad should create a todo when the input is valid', async () => {
      // WHY THIS IS BAD: The story should be “todo was created.” This proves *how* (log copy, full save()
      // arguments, clock call count). Renaming a log line or refactoring internals breaks the test even when
      // behavior is still correct — implementation coupling (Art of Unit Testing: avoid testing how).

      const {
        todoService,
        mockRepository,
        mockNotificationService,
        mockAnalyticsService,
        mockLogger,
        mockClock
      } = createWithBadMocks();

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

      expect(mockLogger.info).toHaveBeenCalledTimes(2);
      expect(mockLogger.info).toHaveBeenNthCalledWith(1, 'Creating new todo', { title: 'Learn Jest' });
      expect(mockLogger.info).toHaveBeenNthCalledWith(2, 'Todo created successfully', { todoId: 1 });

      expect(mockRepository.save).toHaveBeenCalledWith({
        title: 'Learn Jest',
        userEmail: 'user@test.com',
        status: 'pending',
        createdAt: '2023-01-01T12:00:00.000Z',
        updatedAt: '2023-01-01T12:00:00.000Z'
      });

      expect(mockAnalyticsService.track).toHaveBeenCalledWith('todo_created', {
        todoId: 1,
        priority: 'medium',
        hasDueDate: false
      });

      expect(mockClock.now).toHaveBeenCalledTimes(2);
      expect(mockNotificationService.sendReminder).not.toHaveBeenCalled();
      expect(result).toEqual(savedTodo);
    });

    it('@good should create a todo when the input is valid', async () => {
      // WHY THIS IS GOOD: Asserts what callers care about — returned todo and that analytics recorded
      // creation. Skips logger and exact save payload — behavior and important outcomes only.

      const { todoService, stubRepository, mockNotificationService, mockAnalyticsService } =
        createWithGoodMocks();

      const todoData = { title: 'Learn Jest', userEmail: 'user@test.com' };
      const expectedTodo = {
        id: 1,
        title: 'Learn Jest',
        userEmail: 'user@test.com',
        status: 'pending',
        createdAt: '2023-01-01T12:00:00.000Z',
        updatedAt: '2023-01-01T12:00:00.000Z'
      };

      stubRepository.save.mockResolvedValue(expectedTodo);

      const result = await todoService.createTodo(todoData);

      expect(result).toEqual(expectedTodo);
      expect(result.status).toBe('pending');
      expect(result.id).toBeDefined();

      expect(mockAnalyticsService.track).toHaveBeenCalledWith(
        'todo_created',
        expect.objectContaining({
          todoId: 1,
          hasDueDate: false
        })
      );
    });
  });

  describe('completeTodo', () => {
    it('@bad should complete a pending todo when the caller supplies an email', async () => {
      // WHY THIS IS BAD: Audits implementation detail (every call count, exact log strings, exact email
      // body, exact analytics payload including timeToComplete). Harmless refactors break this test.

      const {
        todoService,
        mockRepository,
        mockNotificationService,
        mockAnalyticsService,
        mockLogger,
        mockClock
      } = createWithBadMocks();

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

      expect(mockRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
      expect(mockAnalyticsService.track).toHaveBeenCalledTimes(1);
      expect(mockNotificationService.sendReminder).toHaveBeenCalledTimes(1);
      expect(mockClock.now).toHaveBeenCalledTimes(2);

      expect(mockLogger.info).toHaveBeenCalledWith('Completing todo', { todoId: 1 });
      expect(mockLogger.info).toHaveBeenCalledWith('Todo completed successfully', { todoId: 1 });

      expect(mockAnalyticsService.track).toHaveBeenCalledWith('todo_completed', {
        todoId: 1,
        timeToComplete: 7200000
      });

      expect(mockNotificationService.sendReminder).toHaveBeenCalledWith(
        'Great job! You completed: Learn testing',
        'user@test.com'
      );

      expect(result.status).toBe('completed');
    });

    it('@good should complete a pending todo when the caller supplies an email', async () => {
      // WHY THIS IS GOOD: Checks the todo is completed, analytics includes the todo id, and a reminder
      // went out using a flexible string matcher — survives copy edits and internal reordering.

      const { todoService, stubRepository, mockNotificationService, mockAnalyticsService } =
        createWithGoodMocks();

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

      stubRepository.findById.mockResolvedValue(existingTodo);
      stubRepository.save.mockResolvedValue(completedTodo);

      const result = await todoService.completeTodo(1, 'user@test.com');

      expect(result.status).toBe('completed');
      expect(result.completedAt).toBeDefined();

      expect(mockAnalyticsService.track).toHaveBeenCalledWith(
        'todo_completed',
        expect.objectContaining({
          todoId: 1
        })
      );

      expect(mockNotificationService.sendReminder).toHaveBeenCalledWith(
        expect.stringContaining('completed'),
        'user@test.com'
      );
    });
  });

  describe('createTodo with due date (reminder)', () => {
    it('@bad should create a todo that has a due date and a user email', async () => {
      // WHY THIS IS BAD: The requirement is “user gets reminded.” Locking to one exact sentence and log
      // text is brittle — marketing copy can change without changing behavior.

      const {
        todoService,
        mockRepository,
        mockNotificationService,
        mockAnalyticsService,
        mockLogger,
        mockClock
      } = createWithBadMocks();

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

      expect(mockLogger.info).toHaveBeenCalledWith('Creating new todo', { title: 'Important Meeting' });

      expect(mockNotificationService.sendReminder).toHaveBeenCalledWith(
        'Reminder: Important Meeting is due soon!',
        'user@test.com'
      );

      expect(mockAnalyticsService.track).toHaveBeenCalledWith('todo_created', {
        todoId: 1,
        priority: 'medium',
        hasDueDate: true
      });

      expect(mockRepository.save).toHaveBeenCalledBefore(mockNotificationService.sendReminder);
    });

    it('@good should create a todo that has a due date and a user email', async () => {
      // WHY THIS IS GOOD: Asserts behaviors that matter — notification includes the title and analytics
      // sees hasDueDate — not the exact template string.

      const { todoService, stubRepository, mockNotificationService, mockAnalyticsService } =
        createWithGoodMocks();

      const todoData = {
        title: 'Important Meeting',
        userEmail: 'user@test.com',
        dueDate: '2023-12-31'
      };

      const savedTodo = {
        id: 1,
        ...todoData,
        status: 'pending'
      };

      stubRepository.save.mockResolvedValue(savedTodo);

      await todoService.createTodo(todoData);

      expect(mockNotificationService.sendReminder).toHaveBeenCalledWith(
        expect.stringContaining('Important Meeting'),
        'user@test.com'
      );

      expect(mockAnalyticsService.track).toHaveBeenCalledWith(
        'todo_created',
        expect.objectContaining({
          hasDueDate: true
        })
      );
    });
  });

  describe('createTodo validation failure', () => {
    it('@bad should fail createTodo when the title fails validation', async () => {
      // WHY THIS IS BAD: One “god” test with many unrelated expectations; pins exact messages and logger
      // call order — hard to see what broke and brittle when copy or ordering changes.

      const {
        todoService,
        mockRepository,
        mockNotificationService,
        mockAnalyticsService,
        mockLogger,
        mockClock
      } = createWithBadMocks();

      const invalidTodo = { title: '' };

      await expect(todoService.createTodo(invalidTodo)).rejects.toThrow(
        'Validation failed: Title is required and must be a string'
      );

      expect(mockLogger.info).toHaveBeenCalledWith('Creating new todo', { title: '' });
      expect(mockLogger.error).toHaveBeenCalledWith('Todo validation failed', null, {
        errors: ['Title is required and must be a string']
      });

      expect(mockRepository.save).not.toHaveBeenCalled();
      expect(mockAnalyticsService.track).not.toHaveBeenCalled();
      expect(mockNotificationService.sendReminder).not.toHaveBeenCalled();
      expect(mockClock.now).not.toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledBefore(mockLogger.error);
    });

    it('@good should fail createTodo when the title fails validation', async () => {
      // WHY THIS IS GOOD: One story — invalid input fails and nothing is saved or emitted. No exact prose.

      const { todoService, mockAnalyticsService, mockNotificationService } = createWithGoodMocks();

      const invalidTodo = { title: '' };

      await expect(todoService.createTodo(invalidTodo)).rejects.toThrow('Validation failed');

      expect(mockAnalyticsService.track).not.toHaveBeenCalled();
      expect(mockNotificationService.sendReminder).not.toHaveBeenCalled();
    });
  });

  describe('createTodo repository failure', () => {
    it('@bad should fail createTodo when save throws after validation succeeds', async () => {
      // WHY THIS IS BAD: Depends on rethrowing the identical Error object and exact logger arguments plus
      // interaction order — internal workflow, not the caller’s contract.

      const {
        todoService,
        mockRepository,
        mockNotificationService,
        mockAnalyticsService,
        mockLogger,
        mockClock
      } = createWithBadMocks();

      const todoData = { title: 'Valid Todo' };
      const dbError = new Error('Database connection failed');

      mockRepository.save.mockRejectedValue(dbError);

      await expect(todoService.createTodo(todoData)).rejects.toBe(dbError);

      expect(mockLogger.error).toHaveBeenCalledWith('Failed to create todo', dbError, { todoData });

      expect(mockLogger.info).toHaveBeenCalledWith('Creating new todo', { title: 'Valid Todo' });

      expect(mockAnalyticsService.track).not.toHaveBeenCalled();
      expect(mockNotificationService.sendReminder).not.toHaveBeenCalled();

      expect(mockRepository.save).toHaveBeenCalledAfter(mockLogger.info);
    });

    it('@good should fail createTodo when save throws after validation succeeds', async () => {
      // WHY THIS IS GOOD: Only checks the user-visible failure and that analytics/reminder did not run.

      const { todoService, stubRepository, mockAnalyticsService, mockNotificationService } =
        createWithGoodMocks();

      const todoData = { title: 'Valid Todo' };
      const dbError = new Error('Database connection failed');

      stubRepository.save.mockRejectedValue(dbError);

      await expect(todoService.createTodo(todoData)).rejects.toThrow('Database connection failed');

      expect(mockAnalyticsService.track).not.toHaveBeenCalled();
      expect(mockNotificationService.sendReminder).not.toHaveBeenCalled();
    });
  });

  describe('deleteTodo', () => {
    it('@bad should delete a todo that exists in the repository', async () => {
      // WHY THIS IS BAD: Delete success is “removed + tracked.” Forcing a specific call sequence breaks
      // on harmless reordering of legal steps — fragile interaction test.

      const {
        todoService,
        mockRepository,
        mockAnalyticsService,
        mockLogger,
        mockClock
      } = createWithBadMocks();

      const completedTodo = {
        id: 1,
        title: 'Completed Task',
        status: 'completed'
      };

      mockRepository.findById.mockResolvedValue(completedTodo);
      mockRepository.delete.mockResolvedValue(true);

      const result = await todoService.deleteTodo(1);

      expect(mockLogger.info).toHaveBeenNthCalledWith(1, 'Deleting todo', { todoId: 1 });
      expect(mockRepository.findById).toHaveBeenCalledAfter(mockLogger.info);
      expect(mockRepository.delete).toHaveBeenCalledAfter(mockRepository.findById);
      expect(mockAnalyticsService.track).toHaveBeenCalledAfter(mockRepository.delete);
      expect(mockLogger.info).toHaveBeenNthCalledWith(2, 'Todo deleted successfully', { todoId: 1 });

      expect(mockAnalyticsService.track).toHaveBeenCalledWith('todo_deleted', {
        todoId: 1,
        wasCompleted: true
      });

      expect(result).toBe(true);
    });

    it('@good should delete a todo that exists in the repository', async () => {
      // WHY THIS IS GOOD: Asserts boolean result and analytics payload with objectContaining — stable refactor.

      const { todoService, stubRepository, mockAnalyticsService } = createWithGoodMocks();

      const completedTodo = {
        id: 1,
        title: 'Completed Task',
        status: 'completed'
      };

      stubRepository.findById.mockResolvedValue(completedTodo);
      stubRepository.delete.mockResolvedValue(true);

      const result = await todoService.deleteTodo(1);

      expect(result).toBe(true);

      expect(mockAnalyticsService.track).toHaveBeenCalledWith(
        'todo_deleted',
        expect.objectContaining({
          todoId: 1,
          wasCompleted: true
        })
      );
    });
  });

  describe('edge cases', () => {
    it('@good should leave an already-completed todo unchanged when completeTodo runs again', async () => {
      // WHY THIS IS GOOD: Documents idempotency — small, state-only assertions.

      const { todoService, stubRepository } = createWithGoodMocks();

      const alreadyCompleted = {
        id: 1,
        title: 'Already done',
        status: 'completed',
        completedAt: '2023-01-01T10:00:00.000Z'
      };

      stubRepository.findById.mockResolvedValue(alreadyCompleted);

      const result = await todoService.completeTodo(1);

      expect(result.status).toBe('completed');
      expect(result.completedAt).toBe('2023-01-01T10:00:00.000Z');
      expect(stubRepository.save).not.toHaveBeenCalled();
    });

    it('@good should create a todo when no due date is provided', async () => {
      // WHY THIS IS GOOD: Negative path (no spam) plus confirmation the happy path still recorded creation.

      const { todoService, stubRepository, mockNotificationService, mockAnalyticsService } =
        createWithGoodMocks();

      const todoWithoutDueDate = { title: 'Simple task' };
      const savedTodo = { id: 1, ...todoWithoutDueDate, status: 'pending' };

      stubRepository.save.mockResolvedValue(savedTodo);

      await todoService.createTodo(todoWithoutDueDate);

      expect(mockNotificationService.sendReminder).not.toHaveBeenCalled();

      expect(mockAnalyticsService.track).toHaveBeenCalledWith(
        'todo_created',
        expect.objectContaining({
          hasDueDate: false
        })
      );
    });
  });
});

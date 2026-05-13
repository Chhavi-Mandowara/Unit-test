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
  function createMocks() {
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
      sendDailyDigest: jest.fn()
    };
    const mockAnalyticsService = { track: jest.fn() };
    const mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn()
    };
    const mockClock = {
      now: jest.fn().mockReturnValue(new Date('2023-01-01T12:00:00Z'))
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
      stubRepository: mockRepository,
      mockNotificationService,
      mockAnalyticsService,
      mockLogger,
      stubLogger: mockLogger,
      mockClock,
      stubClock: mockClock
    };
  }

//Refactoring Scenario
  describe('createTodo', () => {
    it('should create a todo when the input is valid', async () => {
      const {
        todoService,
        mockRepository,
        mockNotificationService,
        mockAnalyticsService,
        mockLogger,
        mockClock
      } = createMocks();

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

    it('@good- should create a todo when the input is valid', async () => {
      const {
        todoService,
        mockRepository,
        mockNotificationService,
        mockAnalyticsService,
        mockClock
      } = createMocks();
    
      const todoData = {
        title: 'Learn Jest',
        userEmail: 'user@test.com'
      };
    
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
    
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Learn Jest',
          userEmail: 'user@test.com',
          status: 'pending',
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        })
      );
      expect(mockClock.now).toHaveBeenCalled();
      expect(mockAnalyticsService.track).toHaveBeenCalledWith(
        'todo_created',
        expect.objectContaining({
          todoId: 1
        })
      );
      expect(mockNotificationService.sendReminder).not.toHaveBeenCalled();
      expect(result).toEqual(savedTodo);
    });
  });

//Changing the order of the calls
  describe('sendDailyDigest', () => {
      it('should deliver the daily digest with totals and record an analytics event', async () => {
        const {
          todoService,
          mockRepository,
          mockNotificationService,
          mockAnalyticsService,
          mockClock
        } = createMocks();

      mockRepository.count.mockResolvedValue(10);
      mockRepository.findByStatus.mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }]);

      const result = await todoService.sendDailyDigest('reader@example.com');

      expect(mockRepository.count).toHaveBeenCalledBefore(mockRepository.findByStatus);
      expect(mockRepository.findByStatus).toHaveBeenCalledWith('pending');
      expect(mockNotificationService.sendDailyDigest).toHaveBeenCalledBefore(mockAnalyticsService.track);
      expect(mockNotificationService.sendDailyDigest).toHaveBeenCalledWith('reader@example.com', 10);
      expect(mockAnalyticsService.track).toHaveBeenCalledWith('daily_digest_sent', {
        userEmail: 'reader@example.com',
        totalTodos: 10,
        pendingTodos: 3
      });
      expect(mockClock.now).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        totalTodos: 10,
        pendingTodos: 3,
        sentAt: '2023-01-01T12:00:00.000Z'
      });
    });

    it('@good-should deliver the daily digest with totals and record an analytics event', async () => {
      const {
        todoService,
        stubRepository,
        mockNotificationService,
        mockAnalyticsService
      } = createMocks();

      stubRepository.count.mockResolvedValue(10);
      stubRepository.findByStatus.mockResolvedValue([{ id: 1 }, { id: 2 }]);

      const result = await todoService.sendDailyDigest('reader@example.com');

      expect(result.totalTodos).toBe(10);
      expect(result.pendingTodos).toBe(2);
      expect(result.sentAt).toBe('2023-01-01T12:00:00.000Z');
      expect(mockNotificationService.sendDailyDigest).toHaveBeenCalledWith('reader@example.com', 10);
      expect(mockAnalyticsService.track).toHaveBeenCalledWith(
        'daily_digest_sent',
        expect.objectContaining({
          userEmail: 'reader@example.com',
          totalTodos: 10,
          pendingTodos: 2
        })
      );
    });
  });

  describe('deleteTodo', () => {
    it('@bad deleteTodo — nth + call-after chain (order and log copy coupling)', async () => {
      const { todoService, mockRepository, mockAnalyticsService, mockLogger } = createMocks();

      const completedTodo = {
        id: 1,
        title: 'Completed Task',
        status: 'completed'
      };

      mockRepository.findById.mockResolvedValue(completedTodo);
      mockRepository.delete.mockResolvedValue(true);

      const result = await todoService.deleteTodo(1);

      expect(mockRepository.findById).toHaveBeenCalledAfter(mockLogger.info);
      expect(mockRepository.delete).toHaveBeenCalledAfter(mockRepository.findById);
      expect(mockAnalyticsService.track).toHaveBeenCalledAfter(mockRepository.delete);

      expect(mockAnalyticsService.track).toHaveBeenCalledWith('todo_deleted', {
        todoId: 1,
        wasCompleted: true
      });

      expect(result).toBe(true);
    });

    it('@good should delete a todo that exists in the repository', async () => {
      const { todoService, stubRepository, mockAnalyticsService } = createMocks();

      const completedTodo = {
        id: 1,
        title: 'Completed Task',
        status: 'completed'
      };

      stubRepository.findById.mockResolvedValue(completedTodo);
      stubRepository.delete.mockResolvedValue(true);

      const result = await todoService.deleteTodo(1);

      expect(result).toBe(true);
      expect(stubRepository.findById).toHaveBeenCalledWith(1);
      expect(stubRepository.delete).toHaveBeenCalledWith(1);
      expect(mockAnalyticsService.track).toHaveBeenCalledWith(
        'todo_deleted',
        expect.objectContaining({
          todoId: 1,
          wasCompleted: true
        })
      );
    });
  });

  describe('createTodo validation failure', () => {
    it('should fail createTodo when the title fails validation', async () => {
      const {
        todoService,
        mockRepository,
        mockNotificationService,
        mockAnalyticsService,
        mockLogger,
        mockClock
      } = createMocks();

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

      const { todoService, mockAnalyticsService, mockNotificationService } = createMocks();

      const invalidTodo = { title: '' };

      await expect(todoService.createTodo(invalidTodo)).rejects.toThrow('Validation failed');

      expect(mockAnalyticsService.track).not.toHaveBeenCalled();
      expect(mockNotificationService.sendReminder).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('@good should leave an already-completed todo unchanged when completeTodo runs again', async () => {
      // WHY THIS IS GOOD: Documents idempotency — small, state-only assertions.

      const { todoService, stubRepository } = createMocks();

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
  });

  describe('listTodos', () => {
    it('@bad should list todos and verify findAll was called exactly once', async () => {
      // BAD TEST: incoming dependency — counting calls couples to “how many times we asked,” not what we got.
      const { todoService, mockRepository, mockAnalyticsService } = createMocks();

      const rows = [{ id: 1, title: 'A', status: 'pending' }];
      mockRepository.findAll.mockResolvedValue(rows);

      const result = await todoService.listTodos(null);

      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(rows);
      expect(mockAnalyticsService.track).toHaveBeenCalled();
    });

    it('@good should list todos as returned by the repository', async () => {
      // GOOD TEST: stub as input — assert the outcome list; ignore how many times findAll ran.
      const { todoService, mockRepository } = createMocks();

      const rows = [{ id: 1, title: 'A', status: 'pending' }];
      mockRepository.findAll.mockResolvedValue(rows);

      const result = await todoService.listTodos(null);

      expect(result).toEqual(rows);
      expect(result[0].title).toBe('A');
    });
  });

  describe('completeTodo', () => {
    it('completes a pending todo, persists completion, notifies owner, and records analytics', async () => {
      const { todoService, stubRepository, mockNotificationService, mockAnalyticsService } =
        createMocks();
      const pendingTodo = {
        id: 7,
        title: 'Ship feature',
        status: 'pending',
        createdAt: '2023-01-01T10:00:00.000Z',
        updatedAt: '2023-01-01T10:00:00.000Z'
      };
      stubRepository.findById.mockResolvedValue(pendingTodo);
      stubRepository.save.mockImplementation((row) => Promise.resolve(row));

      const result = await todoService.completeTodo(7, 'owner@example.com');

      expect(result).toMatchObject({
        id: 7,
        title: 'Ship feature',
        status: 'completed',
        completedAt: '2023-01-01T12:00:00.000Z',
        updatedAt: '2023-01-01T12:00:00.000Z'
      });
      expect(stubRepository.findById).toHaveBeenCalledWith(7);
      expect(stubRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 7,
          status: 'completed',
          title: 'Ship feature'
        })
      );
      expect(mockNotificationService.sendReminder).toHaveBeenCalledWith(
        expect.stringContaining('Ship feature'),
        'owner@example.com'
      );
      expect(mockAnalyticsService.track).toHaveBeenCalledWith(
        'todo_completed',
        expect.objectContaining({
          todoId: 7,
          timeToComplete: expect.any(Number)
        })
      );
    });
  });
});

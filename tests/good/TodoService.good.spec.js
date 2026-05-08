const TodoService = require('../../src/services/TodoService');

describe('TodoService - GOOD TESTS (Presentation Comparison)', () => {
  let todoService;
  let stubRepository;
  let mockNotificationService;
  let mockAnalyticsService;
  let stubLogger;
  let stubClock;

  beforeEach(() => {
    // GOOD: Using stubs for inputs/queries and mocks only for important side effects
    // This makes tests more focused and less brittle
    stubRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByStatus: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    };

    // GOOD: Mock for side effects we care about verifying
    mockNotificationService = {
      sendReminder: jest.fn(),
      sendDailyDigest: jest.fn()
    };

    // GOOD: Mock for side effects we care about verifying  
    mockAnalyticsService = {
      track: jest.fn()
    };

    // GOOD: Stub for logger - we rarely need to verify logging in unit tests
    stubLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn()
    };

    // GOOD: Stub for time provider - just returns what our test needs
    stubClock = {
      now: jest.fn().mockReturnValue(new Date('2023-01-01T12:00:00Z'))
    };

    todoService = new TodoService(
      stubRepository,
      mockNotificationService,
      mockAnalyticsService,
      stubLogger,
      stubClock
    );
  });

  // ===================================================================
  // SCENARIO 1: Creating a todo successfully
  // ===================================================================
  describe('creates todo successfully', () => {
    it('GOOD TEST: behavior-focused and refactor-safe', async () => {
      // GOOD TEST: This test focuses on WHAT the method should accomplish
      // It will survive internal refactoring because it only tests behavior

      const todoData = { title: 'Learn Jest', userEmail: 'user@test.com' };
      const expectedTodo = {
        id: 1,
        title: 'Learn Jest',
        userEmail: 'user@test.com',
        status: 'pending',
        createdAt: '2023-01-01T12:00:00.000Z',
        updatedAt: '2023-01-01T12:00:00.000Z'
      };
      
      // GOOD: Stub returns the data we need for this test
      stubRepository.save.mockResolvedValue(expectedTodo);

      const result = await todoService.createTodo(todoData);

      // GOOD: Testing the primary behavior - todo was created successfully
      expect(result).toEqual(expectedTodo);
      expect(result.status).toBe('pending');
      expect(result.id).toBeDefined();

      // GOOD: Only verifying the important side effect - analytics tracking
      expect(mockAnalyticsService.track).toHaveBeenCalledWith('todo_created', 
        expect.objectContaining({
          todoId: 1,
          hasDueDate: false
        })
      );

      // GOOD: We don't verify logging, internal calls, or implementation details
      // This makes the test stable and focused on business behavior
    });
  });

  // ===================================================================
  // SCENARIO 2: Completing a todo successfully
  // ===================================================================
  describe('completes todo successfully', () => {
    it('GOOD TEST: state-based testing with minimal mocking', async () => {
      // GOOD TEST: This test focuses on the end state and important side effects
      // It uses minimal mocking and tests behavior that matters to users

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

      // GOOD: Stubs provide the data we need
      stubRepository.findById.mockResolvedValue(existingTodo);
      stubRepository.save.mockResolvedValue(completedTodo);

      const result = await todoService.completeTodo(1, 'user@test.com');

      // GOOD: Testing the important behavior - todo is now completed
      expect(result.status).toBe('completed');
      expect(result.completedAt).toBeDefined();

      // GOOD: Verify important side effects only
      expect(mockAnalyticsService.track).toHaveBeenCalledWith('todo_completed', 
        expect.objectContaining({
          todoId: 1
        })
      );

      expect(mockNotificationService.sendReminder).toHaveBeenCalledWith(
        expect.stringContaining('completed'),
        'user@test.com'
      );

      // GOOD: We don't verify repository calls, logging, or internal method order
      // This makes the test resilient to refactoring
    });
  });

  // ===================================================================
  // SCENARIO 3: Sending reminder notification for todo with due date
  // ===================================================================
  describe('sends reminder notification for todo with due date', () => {
    it('GOOD TEST: verifies reminder behavior without testing message format', async () => {
      // GOOD TEST: This test verifies that reminders are sent for todos with due dates
      // It doesn't care about exact message format or internal logging

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
      
      // GOOD: Stub provides what we need
      stubRepository.save.mockResolvedValue(savedTodo);

      await todoService.createTodo(todoData);

      // GOOD: Verify the important behavior - reminder was sent
      expect(mockNotificationService.sendReminder).toHaveBeenCalledWith(
        expect.stringContaining('Important Meeting'),
        'user@test.com'
      );

      // GOOD: Verify analytics tracks due date presence
      expect(mockAnalyticsService.track).toHaveBeenCalledWith('todo_created',
        expect.objectContaining({
          hasDueDate: true
        })
      );

      // GOOD: We don't test exact message format, logging, or call order
      // This allows us to improve messages without breaking tests
    });
  });

  // ===================================================================
  // SCENARIO 4: Validation failure when creating todo
  // ===================================================================
  describe('handles validation failure when creating todo', () => {
    it('GOOD TEST: focused test for validation error behavior', async () => {
      // GOOD TEST: This test has a single, clear purpose - verify validation errors are handled
      // It doesn't test internal implementation details of how validation works

      const invalidTodo = { title: '' }; // Empty title should fail

      // GOOD: Testing the behavior - that an error is thrown for invalid input
      await expect(todoService.createTodo(invalidTodo))
        .rejects
        .toThrow('Validation failed');

      // GOOD: Verify no side effects occurred when validation failed
      expect(mockAnalyticsService.track).not.toHaveBeenCalled();
      expect(mockNotificationService.sendReminder).not.toHaveBeenCalled();

      // GOOD: We don't test exact error messages, logging behavior, or internal validation logic
      // This allows us to improve error messages without breaking tests
    });
  });

  // ===================================================================
  // SCENARIO 5: Repository failure during todo creation
  // ===================================================================
  describe('handles repository failure during todo creation', () => {
    it('GOOD TEST: tests error propagation behavior', async () => {
      // GOOD TEST: This test verifies that database errors are properly handled
      // It focuses on behavior rather than internal error handling implementation

      const todoData = { title: 'Valid Todo' };
      const dbError = new Error('Database connection failed');
      
      // GOOD: Stub simulates the failure scenario
      stubRepository.save.mockRejectedValue(dbError);

      // GOOD: Testing behavior - that database errors are propagated to caller
      await expect(todoService.createTodo(todoData))
        .rejects
        .toThrow('Database connection failed');

      // GOOD: Verify no side effects occurred during failure
      expect(mockAnalyticsService.track).not.toHaveBeenCalled();
      expect(mockNotificationService.sendReminder).not.toHaveBeenCalled();

      // GOOD: We don't test logging details, exact error objects, or internal cleanup
      // This makes the test stable and focused on the contract with callers
    });
  });

  // ===================================================================
  // SCENARIO 6: Deleting a completed todo
  // ===================================================================
  describe('deletes a completed todo', () => {
    it('GOOD TEST: refactor-safe test focused on deletion outcome', async () => {
      // GOOD TEST: This test will survive refactoring because it only tests
      // the business outcome and important side effects

      const completedTodo = { 
        id: 1, 
        title: 'Completed Task', 
        status: 'completed' 
      };
      
      // GOOD: Stubs provide the scenario data
      stubRepository.findById.mockResolvedValue(completedTodo);
      stubRepository.delete.mockResolvedValue(true);

      const result = await todoService.deleteTodo(1);

      // GOOD: Testing the primary behavior - deletion was successful
      expect(result).toBe(true);

      // GOOD: Verify important side effect - analytics tracks completion status
      expect(mockAnalyticsService.track).toHaveBeenCalledWith('todo_deleted', 
        expect.objectContaining({
          todoId: 1,
          wasCompleted: true
        })
      );

      // GOOD: We don't test method call order, logging, or internal operations
      // This allows us to refactor internal implementation without fear
    });
  });

  // ===================================================================
  // ADDITIONAL GOOD TEST: Edge case handling
  // ===================================================================
  describe('handles edge cases gracefully', () => {
    it('GOOD TEST: completing already completed todo is idempotent', async () => {
      // GOOD TEST: Testing important business rule - idempotent operations
      
      const alreadyCompleted = {
        id: 1,
        title: 'Already done',
        status: 'completed',
        completedAt: '2023-01-01T10:00:00.000Z'
      };
      
      stubRepository.findById.mockResolvedValue(alreadyCompleted);

      const result = await todoService.completeTodo(1);

      // GOOD: Verify idempotent behavior
      expect(result.status).toBe('completed');
      expect(result.completedAt).toBe('2023-01-01T10:00:00.000Z'); // Unchanged

      // GOOD: Verify no unnecessary operations occurred
      expect(stubRepository.save).not.toHaveBeenCalled();
    });

    it('GOOD TEST: creating todo without due date does not send notification', async () => {
      // GOOD TEST: Testing negative case behavior clearly
      
      const todoWithoutDueDate = { title: 'Simple task' };
      const savedTodo = { id: 1, ...todoWithoutDueDate, status: 'pending' };
      
      stubRepository.save.mockResolvedValue(savedTodo);

      await todoService.createTodo(todoWithoutDueDate);

      // GOOD: Verify notification is NOT sent when not needed
      expect(mockNotificationService.sendReminder).not.toHaveBeenCalled();

      // GOOD: But analytics should still track creation
      expect(mockAnalyticsService.track).toHaveBeenCalledWith('todo_created',
        expect.objectContaining({
          hasDueDate: false
        })
      );
    });
  });
});
# Todo Unit Testing Demo

A realistic JavaScript Todo application designed specifically for demonstrating **good vs bad unit testing practices** from *"The Art of Unit Testing"* by Roy Osherove.

🎯 **Purpose**: This is NOT about building a Todo app. It's about learning proper unit testing through concrete, real-world examples.

## 🆚 **PRESENTATION-READY: Side-by-Side Test Comparisons**

**Each BAD test has a matching GOOD test for the EXACT SAME scenario!**

Perfect for live demonstrations where you can show both approaches side-by-side and prove that good tests survive refactoring while bad tests break.

📋 **See `presentation-comparison-guide.md` for detailed presentation flow!**

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run only **@bad** examples (Jest `--testNamePattern`)
npm run test:bad

# Run only **@good** examples
npm run test:good

# Run only supporting modules (clock, logger, repository, notifications, analytics)
npm run test:support

# Interactive refactoring demo
node demo-refactor.js
```

## 📋 What's Included

### Application Features
- ✅ Create, complete, delete todos
- ✅ List todos with status filtering
- ✅ Update existing todos
- ✅ Reminder notifications
- ✅ Daily digest emails
- ✅ Analytics tracking
- ✅ Comprehensive logging
- ✅ Input validation

### Services and modules (kebab-case files)

- **`todo-service.js`**: Main business logic orchestrator  
- **`todo-repository.js`**: Data persistence (in-memory)  
- **`notification-service.js`**: Email/reminder system  
- **`analytics-service.js`**: Event tracking  
- **`logger.js`**: Application logging  
- **`clock.js`**: Time provider (testable)  
- **`todo-validator.js`**: Input validation  

### Supporting modules (simple demo specs)

Small co-located specs you can walk through before the main **@bad** / **@good** todo tests:

| File | What it shows |
|------|----------------|
| `src/utils/clock.spec.js` | Injectable time / non-determinism seam |
| `src/services/logger.spec.js` | Prefer inspecting `getLogs()` over asserting console text |
| `src/services/analytics-service.spec.js` | Stub logger, assert `track` outcomes |
| `src/services/notification-service.spec.js` | Async + collaborator, outcome-focused |
| `src/repositories/todo-repository.spec.js` | Async persistence, state after `await` |

Run only these: `npm run test:support`

### Co-located tests (**@bad** vs **@good**)

- **`src/services/todo-service.spec.js`** and **`src/utils/todo-validator.spec.js`**: One **`describe` per feature** (e.g. `createTodo`). Inside each block you scroll **one `@bad` test** (over-specified / implementation-coupled), then **one `@good` test** for the same scenario, with **`// WHY THIS IS BAD`** / **`// WHY THIS IS GOOD`** comments under each title. Extra **`@good`**-only examples appear where there is no paired anti-pattern (e.g. edge cases).

`npm run test:bad` runs tests whose full name matches **`@bad`**; `npm run test:good` matches **`@good`**.

## Anti-patterns illustrated in **`@bad`** tests

These demonstrate common mistakes (see the **`@bad`** `it(...)` blocks in `*.spec.js`):
```javascript
// BAD: Mocking every dependency even when not needed
expect(mockLogger.info).toHaveBeenCalledTimes(2);
expect(mockAnalyticsService.track).toHaveBeenCalledTimes(1);
expect(mockClock.now).toHaveBeenCalledTimes(1);
```

### 2. **Testing Implementation Details**
```javascript
// BAD: Testing exact internal call order and structure
expect(mockLogger.info).toHaveBeenNthCalledWith(1, 'Creating new todo', { title: 'Test' });
expect(mockLogger.info).toHaveBeenNthCalledWith(2, 'Todo created successfully', { todoId: 1 });
```

### 3. **Brittle Error Message Testing**
```javascript
// BAD: Testing exact error message strings
expect(result.errors).toContain('Title cannot exceed 200 characters');
expect(result.errors).not.toContain('Title is too long'); // Over-specification
```

### 4. **God Tests**
```javascript
// BAD: One test verifying validation, logging, analytics, notifications, return values...
it('should handle complete todo creation workflow with all validations, logging, analytics, and notifications', async () => {
  // 50+ lines testing everything at once
});
```

### 5. **Wrong Mock vs Stub Usage**
```javascript
// BAD: Using mocks for inputs when stubs suffice
mockRepository.findAll = jest.fn().mockResolvedValue(todos);
expect(mockRepository.findAll).toHaveBeenCalledTimes(1); // Unnecessary verification
```

## ✨ Best practices (**`@good`** tests)

The **`@good`** tests in the same spec files demonstrate habits from *The Art of Unit Testing*:

### 1. **Behavior-Focused Testing**
```javascript
// GOOD: Testing what the method should accomplish
it('should return a saved todo with pending status', async () => {
  const result = await todoService.createTodo(todoData);
  expect(result.status).toBe('pending');
});
```

### 2. **Minimal Mocking Strategy**
```javascript
// GOOD: Stubs for inputs, mocks only for important side effects
stubRepository.save.mockResolvedValue(expectedTodo); // Stub - just returns data
expect(mockAnalyticsService.track).toHaveBeenCalledWith(/*...*/); // Mock - verify side effect
```

### 3. **State-Based Testing When Possible**
```javascript
// GOOD: Testing the end state rather than internal calls
const result = await todoService.completeTodo(1);
expect(result.status).toBe('completed');
expect(result.completedAt).toBeDefined();
```

### 4. **Focused, Single-Responsibility Tests**
```javascript
// GOOD: Each test has one clear purpose
it('should track todo creation in analytics', async () => {
  await todoService.createTodo(todoData);
  expect(mockAnalyticsService.track).toHaveBeenCalledWith('todo_created', expect.any(Object));
});
```

### 5. **Refactor-Safe Assertions**
```javascript
// GOOD: Testing behavior that survives internal changes
expect(result.errors.some(error => error.includes('title'))).toBe(true);
```

## 🔧 Interactive Refactoring Demo

Run the demo to see how bad tests break but good tests survive harmless refactoring:

```bash
node demo-refactor.js
```

### What the Demo Does:
1. ✅ Runs all tests with original implementation (all pass)
2. 🔧 Applies harmless refactoring (reorder internal calls, extract methods, add caching)
3. 💥 Runs **`npm run test:bad`** → **FAIL** (implementation-coupled assertions)
4. ✨ Runs **`npm run test:good`** → **PASS** (behavior-focused)
5. 🔄 Restores original implementation

### Refactoring Changes Made:
- Reorder analytics and notification calls
- Extract validation to private methods  
- Change logging call order
- Add internal caching (implementation detail)

## 🎤 Presentation Flow

### Opening (5 minutes)
1. **Problem Statement**: Why do tests break during refactoring?
2. **Show the codebase**: Realistic Todo app with dependencies
3. **The Goal**: Write tests that give confidence, not fear

### Side-by-Side Comparison (10 minutes)
1. **Pick one scenario**: E.g., "Creating a Todo Successfully"
2. **Show both tests side-by-side**:
   - BAD: 15+ assertions testing implementation details
   - GOOD: 4 assertions testing behavior
3. **Highlight differences**: Over-mocking vs minimal mocking
4. **Key Message**: "Both test the same behavior, different approaches"

### Live Demo Impact (5 minutes)
1. **Run both test suites**: Show they both pass
2. **Point out**: "Both seem to work fine... but wait!"

### Live Refactoring Demo (10 minutes)
1. **Run the demo**: `node demo-refactor.js`
2. **Show the results**:
   - Bad tests break (expected)
   - Good tests pass (confidence!)
3. **Explain why**: Implementation vs behavior focus

### Q&A and Discussion (10 minutes)
- When to use mocks vs stubs?
- How to identify implementation coupling?
- Strategies for legacy code

## 📚 Key Principles Demonstrated

### From "The Art of Unit Testing":

1. **Test Behavior, Not Implementation**
   - Focus on what the method should accomplish
   - Don't test how it accomplishes it

2. **Use Stubs for Inputs, Mocks for Outputs**
   - Stub dependencies that provide data
   - Mock dependencies for side effects you care about

3. **Write Maintainable Tests**
   - Tests should survive harmless refactoring
   - Avoid testing private method behavior
   - Don't over-specify interactions

4. **One Assert Per Test (When Reasonable)**
   - Each test should verify one logical concept
   - Makes failures easier to understand

5. **Test Edge Cases and Error Conditions**
   - Happy path is not enough
   - Test validation, null cases, error handling

## 🏗️ Project Structure

```
├── src/
│   ├── services/
│   │   ├── todo-service.js
│   │   ├── todo-service.spec.js
│   │   ├── todo-service.refactored.js
│   │   ├── logger.js
│   │   ├── logger.spec.js
│   │   ├── notification-service.js
│   │   ├── notification-service.spec.js
│   │   ├── analytics-service.js
│   │   ├── analytics-service.spec.js
│   │   └── ...
│   ├── repositories/
│   │   ├── todo-repository.js
│   │   └── todo-repository.spec.js
│   └── utils/
│       ├── clock.js
│       ├── clock.spec.js
│       ├── todo-validator.js
│       └── todo-validator.spec.js
├── demo-refactor.js
├── refactoring-demo.md
├── presentation-comparison-guide.md
├── presentation-notes.md
└── package.json
```

## 🎯 Learning Outcomes

After this presentation, your team will understand:

✅ **Why tests break during refactoring**
- Implementation coupling vs behavior testing
- The cost of brittle tests

✅ **How to write maintainable tests**
- Mocks vs stubs distinction
- State-based vs interaction-based testing
- Proper assertion strategies

✅ **When to mock and when not to**
- Mock important side effects
- Stub simple data providers
- Avoid over-mocking

✅ **How to identify test smells**
- Implementation detail testing
- Over-specified assertions
- God tests and test bloat

## 🔗 References

- 📖 ["The Art of Unit Testing" by Roy Osherove](https://www.artofunittesting.com/)
- 🧪 [Jest Testing Framework](https://jestjs.io/)
- 🎭 [Test Doubles (Mocks, Stubs, Spies)](https://martinfowler.com/bliki/TestDouble.html)

---

**Made for learning, not for production** 📚

This codebase is intentionally structured to demonstrate testing concepts. Focus on the testing strategies, not the application architecture.
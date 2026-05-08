# Presentation Speaker Notes

## Opening Hook (2 minutes)

"How many of you have experienced this: You're refactoring some code - maybe extracting a method, reordering some internal calls, or just improving readability. The behavior of your code hasn't changed at all, but suddenly half your tests are failing. Sound familiar?"

"Today we're going to explore why this happens and how to write tests that give you confidence instead of fear when refactoring."

## Demo Setup (3 minutes)

1. **Show the codebase structure**: "This is a realistic Todo application with services, repositories, validation - the kind of dependencies you see in real corporate codebases."

2. **Point out test organization**: "Notice we have two test folders - `bad` and `good`. This isn't about broken vs working tests - they all pass right now. It's about maintainable vs brittle tests."

## Bad Tests Deep Dive (10 minutes)

### Run the bad tests first:
```bash
npm run test:bad
```

### Show examples while explaining:

1. **Over-mocking example** (TodoService.bad.spec.js lines 130-145):
   ```javascript
   // BAD: Verifying every single mock call
   expect(mockRepository.findById).toHaveBeenCalledTimes(1);
   expect(mockRepository.save).toHaveBeenCalledTimes(1);
   expect(mockLogger.info).toHaveBeenCalledTimes(2);
   expect(mockAnalyticsService.track).toHaveBeenCalledTimes(1);
   expect(mockClock.now).toHaveBeenCalledTimes(2);
   ```
   
   **"This test is verifying EVERY internal call. If I add one more log statement, this breaks."**

2. **Implementation detail testing** (lines 84-87):
   ```javascript
   // BAD: Testing exact log messages and call order
   expect(mockLogger.info).toHaveBeenNthCalledWith(1, 
     'Creating new todo', { title: 'Test Todo' });
   ```
   
   **"This test will break if I change the log message from 'Creating new todo' to 'Starting todo creation'. But does the user care about the exact wording?"**

3. **God test** (lines 195-240):
   
   **"This one test is trying to verify validation, logging, analytics, notifications, and return values. When it fails, good luck figuring out why!"**

## Good Tests Deep Dive (10 minutes)

### Run the good tests:
```bash
npm run test:good
```

### Show contrasting examples:

1. **Behavior-focused testing** (TodoService.good.spec.js lines 25-35):
   ```javascript
   // GOOD: Testing what the method should accomplish
   it('should return a saved todo with pending status', async () => {
     const result = await todoService.createTodo(todoData);
     expect(result.status).toBe('pending');
   });
   ```
   
   **"This test cares about the outcome - that todos start as pending. It doesn't care HOW that happens internally."**

2. **Minimal mocking** (lines 40-50):
   ```javascript
   // GOOD: Only verifying the side effect we care about
   expect(mockAnalyticsService.track).toHaveBeenCalledWith('todo_created', 
     expect.objectContaining({ todoId: 1 }));
   ```
   
   **"We only mock and verify the analytics call because tracking is important business logic. We don't verify every internal method call."**

3. **Focused tests** - point out how each test has one clear purpose

## The Magic Moment - Live Refactoring (8 minutes)

### Run the demo:
```bash
node demo-refactor.js
```

### Narrate what's happening:
1. **"All tests pass with original implementation"** - Expected
2. **"Applying harmless refactoring"** - Show `TodoService.refactored.js` changes:
   - Changed log messages
   - Extracted private methods
   - Reordered some internal calls
   - Added internal caching
3. **"Bad tests fail"** - Point out the specific failures about log messages
4. **"Good tests still pass"** - The behavior hasn't changed!

### Key insight moment:
**"The bad tests broke because they were testing HOW the code works internally. The good tests passed because they only care about WHAT the code accomplishes for the user."**

## Q&A Preparation

### Common Questions:

**Q: "When should I use mocks vs stubs?"**
A: Use stubs for inputs (things that return data your code needs). Use mocks for outputs (side effects you need to verify happened). Show the difference in our code.

**Q: "Isn't some implementation testing necessary?"**
A: Yes, but focus on testing the contract/interface, not the internal mechanics. If changing the internal order breaks your test, you're testing too much implementation.

**Q: "How do I handle legacy code with lots of bad tests?"**
A: Refactor tests gradually. When you touch a test, ask: "What behavior is this actually testing?" Then rewrite to focus on that behavior.

**Q: "Should I never verify method calls?"**
A: Verify calls for important side effects (like sending emails, recording analytics). Don't verify calls just because you can.

## Closing (2 minutes)

**Key Takeaways:**
1. **Test behavior, not implementation**
2. **Use stubs for inputs, mocks for important outputs**  
3. **Write tests that survive harmless refactoring**
4. **Focus on what the code should do, not how it does it**

**"Your tests should give you confidence to improve your code, not trap you in the current implementation. Good tests are your safety net for fearless refactoring."**

## Technical Setup Notes

- Make sure Jest is installed: `npm install`
- Verify demo works: `node demo-refactor.js`
- Have backup slides ready in case of technical issues
- Consider having the code open in an IDE for better visibility

## Timing Breakdown (35 minutes total)
- Opening: 2 min
- Setup: 3 min  
- Bad tests: 10 min
- Good tests: 10 min
- Refactoring demo: 8 min
- Q&A: 2 min (or extend as needed)
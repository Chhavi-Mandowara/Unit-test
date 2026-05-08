# Refactoring Demo: Bad Tests vs Good Tests

This document demonstrates how bad tests break when we make harmless refactoring changes, while good tests remain stable.

## The Refactoring

We'll make these **harmless internal changes** to `TodoService.js`:

1. **Change logging order** - Log success after analytics instead of before
2. **Extract helper method** - Move validation logic to a private method
3. **Reorder internal operations** - Do analytics tracking before notifications
4. **Add internal caching** - Cache the last created todo (implementation detail)

## Before Refactoring

The original `createTodo` method works like this:
1. Log "Creating new todo"
2. Validate input
3. Create todo object
4. Save to repository
5. Track analytics
6. Send notification (if needed)
7. Log "Todo created successfully"
8. Return saved todo

## After Refactoring

The refactored version will:
1. Log "Creating new todo"
2. Validate input (moved to private method)
3. Create todo object
4. Save to repository
5. **Track analytics BEFORE notification** (reordered)
6. Send notification (if needed)
7. **Cache the todo** (new implementation detail)
8. Log "Todo created successfully" **AFTER analytics** (reordered)
9. Return saved todo

## What Should Happen

- **BAD TESTS**: Will fail because they test implementation details like exact call order, exact log messages, etc.
- **GOOD TESTS**: Will pass because they only test the final behavior and important side effects

## Running the Demo

1. First, run the tests to see they all pass:
   ```bash
   npm test
   ```

2. Apply the refactoring changes (see `src/services/TodoService.refactored.js`)

3. Run bad tests - they should fail:
   ```bash
   npm run test:bad
   ```

4. Run good tests - they should still pass:
   ```bash
   npm run test:good
   ```

This demonstrates why focusing on behavior rather than implementation makes tests more maintainable.
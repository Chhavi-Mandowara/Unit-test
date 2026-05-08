#!/usr/bin/env node

/**
 * Demo script to show how refactoring breaks bad tests but not good tests
 * Run this script to see the demonstration
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const originalFile = path.join(__dirname, 'src/services/TodoService.js');
const refactoredFile = path.join(__dirname, 'src/services/TodoService.refactored.js');
const backupFile = path.join(__dirname, 'src/services/TodoService.original.js');

console.log('🧪 Todo Unit Testing Demo: Bad Tests vs Good Tests');
console.log('================================================\n');

console.log('This demo shows how refactoring affects different types of tests:');
console.log('- BAD tests: Test implementation details and break on harmless changes');
console.log('- GOOD tests: Test behavior and remain stable during refactoring\n');

// Step 1: Run original tests
console.log('📋 Step 1: Running tests with original implementation...');
try {
  execSync('npm test', { stdio: 'pipe' });
  console.log('✅ All tests pass with original implementation\n');
} catch (error) {
  console.log('❌ Some tests failed with original implementation');
  console.log('Please fix tests before running demo\n');
  process.exit(1);
}

// Step 2: Backup original and apply refactoring
console.log('🔧 Step 2: Applying refactoring changes...');
fs.copyFileSync(originalFile, backupFile);
fs.copyFileSync(refactoredFile, originalFile);
console.log('✅ Refactoring applied\n');

// Step 3: Run bad tests
console.log('💥 Step 3: Running BAD tests (should fail)...');
console.log('These tests break because they test implementation details:\n');
try {
  execSync('npm run test:bad', { stdio: 'inherit' });
  console.log('\n❌ Bad tests should have failed but they passed');
} catch (error) {
  console.log('\n💡 As expected, bad tests FAILED because they test:');
  console.log('   - Exact logging call order');
  console.log('   - Internal method call sequences');
  console.log('   - Implementation details that changed\n');
}

// Step 4: Run good tests  
console.log('✨ Step 4: Running GOOD tests (should still pass)...');
console.log('These tests should pass because they only test behavior:\n');
try {
  execSync('npm run test:good', { stdio: 'inherit' });
  console.log('\n✅ Good tests PASSED because they test:');
  console.log('   - Final outcomes and return values');
  console.log('   - Important side effects only');
  console.log('   - Behavior that users care about\n');
} catch (error) {
  console.log('\n❌ Good tests failed - this shouldn\'t happen');
  console.log('The refactoring may have broken actual behavior\n');
}

// Step 5: Restore original
console.log('🔄 Step 5: Restoring original implementation...');
fs.copyFileSync(backupFile, originalFile);
fs.unlinkSync(backupFile);
console.log('✅ Original implementation restored\n');

console.log('🎯 Demo Summary:');
console.log('===============');
console.log('- BAD tests broke when we made harmless internal changes');
console.log('- GOOD tests remained stable because behavior didn\'t change');
console.log('- This is why "The Art of Unit Testing" emphasizes testing behavior over implementation');
console.log('- Refactor-safe tests give you confidence to improve code without fear\n');

console.log('📚 Key Principles Demonstrated:');
console.log('- Use stubs for inputs, mocks for important outputs');
console.log('- Test behavior, not implementation');
console.log('- Avoid testing exact call order unless it matters to users');
console.log('- Focus on what the method should do, not how it does it');
console.log('- Write tests that survive harmless refactoring\n');

console.log('🏃‍♀️ To run this demo again: node demo-refactor.js');
import { recursiveMirror } from './architect-4.0-recursive-mirror.js';

console.log('recursiveMirror:', recursiveMirror);
console.log('Has processThought:', typeof recursiveMirror.processThought);

// Test it
try {
  const result = await recursiveMirror.processThought('Hello', {
    currentAwareness: 0.8,
    consciousness: {}
  });
  console.log('Test result:', result);
} catch (error) {
  console.error('Test error:', error.message);
}

import { helloWorld } from '../src/helloWorld';

test('returns "Hello, World!"', () => {
    expect(helloWorld()).toBe('Hello, World!');
});
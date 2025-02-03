import { describe, expect, it, vi } from 'vitest';

import { asyncAttempt } from '.';

describe('asyncAttempt', () => {
  it('should return the result of the function when it resolves successfully', async () => {
    const mockFunc = vi.fn().mockResolvedValue('success');
    const fallback = 'fallback';

    const result = await asyncAttempt(mockFunc, fallback);

    expect(result).toBe('success');
    expect(mockFunc).toHaveBeenCalled();
  });

  it('should return the fallback value when the function throws an error', async () => {
    const mockFunc = vi.fn().mockRejectedValue(new Error('failure'));
    const fallback = 'fallback';

    const result = await asyncAttempt(mockFunc, fallback);

    expect(result).toBe(fallback);
    expect(mockFunc).toHaveBeenCalled();
  });

  it('should not call the fallback function, only return the fallback value', async () => {
    const mockFunc = vi.fn().mockRejectedValue(new Error('failure'));
    const fallback = 'fallback';

    const result = await asyncAttempt(mockFunc, fallback);

    expect(result).toBe(fallback);
    expect(mockFunc).toHaveBeenCalled();
  });

  it('should handle async functions returning promises', async () => {
    const mockFunc = vi.fn(() => Promise.resolve(42));
    const fallback = 0;

    const result = await asyncAttempt(mockFunc, fallback);

    expect(result).toBe(42);
    expect(mockFunc).toHaveBeenCalled();
  });

  it('should handle async functions that throw exceptions', async () => {
    const mockFunc = vi.fn(async () => {
      throw new Error('failure');
    });
    const fallback = 'fallback';

    const result = await asyncAttempt(mockFunc, fallback);

    expect(result).toBe(fallback);
    expect(mockFunc).toHaveBeenCalled();
  });
});

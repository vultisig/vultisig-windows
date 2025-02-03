import { describe, expect, it } from 'vitest';

import { intersection } from '.';

describe('intersection', () => {
  it('should return the common elements across all arrays', () => {
    expect(intersection([1, 2, 3], [2, 3, 4], [3, 4, 5])).toEqual([3]);
    expect(
      intersection(['a', 'b', 'c'], ['b', 'c', 'd'], ['c', 'd', 'e'])
    ).toEqual(['c']);
  });

  it('should return an empty array if there is no intersection', () => {
    expect(intersection([1, 2, 3], [4, 5, 6])).toEqual([]);
    expect(intersection(['x', 'y', 'z'], ['a', 'b', 'c'])).toEqual([]);
  });

  it('should return an empty array if any input array is empty', () => {
    expect(intersection([1, 2, 3], [])).toEqual([]);
    expect(intersection([], [4, 5, 6])).toEqual([]);
  });

  it('should return the first array if only one array is provided', () => {
    expect(intersection([1, 2, 3])).toEqual([1, 2, 3]);
    expect(intersection(['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
  });

  it('should return an empty array if no arrays are provided', () => {
    expect(intersection()).toEqual([]);
  });

  it('should handle duplicate values correctly', () => {
    expect(intersection([1, 1, 2, 3], [1, 3, 3, 4], [1, 3])).toEqual([1, 3]);
  });

  it('should work with arrays of mixed types', () => {
    expect(intersection([1, 'a', true], [true, 'a', 2], [true, 'a'])).toEqual([
      'a',
      true,
    ]);
  });
});

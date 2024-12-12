import { describe, expect, it } from 'vitest';

import { mergeRecords } from '.';

describe('mergeRecords', () => {
  it('should merge multiple records with non-overlapping keys', () => {
    const record1 = { a: 1, b: 2 };
    const record2 = { c: 3, d: 4 };
    const result = mergeRecords(record1 as any, record2);
    expect(result).toEqual({ a: 1, b: 2, c: 3, d: 4 });
  });

  it('should overwrite values for overlapping keys', () => {
    const record1 = { a: 1, b: 2 };
    const record2 = { b: 3, c: 4 };
    const result = mergeRecords(record1 as any, record2);
    expect(result).toEqual({ a: 1, b: 3, c: 4 });
  });

  it('should return an empty record when no records are provided', () => {
    const result = mergeRecords();
    expect(result).toEqual({});
  });

  it('should return the same record when a single record is provided', () => {
    const record = { a: 1, b: 2 };
    const result = mergeRecords(record);
    expect(result).toEqual(record);
  });

  it('should handle empty records gracefully', () => {
    const record1 = { a: 1, b: 2 };
    const record2 = {};
    const result = mergeRecords(record1, record2 as any);
    expect(result).toEqual({ a: 1, b: 2 });
  });
});

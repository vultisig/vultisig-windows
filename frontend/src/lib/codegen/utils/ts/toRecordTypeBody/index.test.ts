import { describe, expect, it } from 'vitest';

import { toRecordTypeBody } from '.';

describe('toRecordTypeBody', () => {
  it('should return an empty object for an empty record', () => {
    const input = {};
    const output = toRecordTypeBody(input);
    expect(output).toBe(`{}`);
  });

  it('should return a single key-value pair formatted correctly', () => {
    const input = { key1: 'value1' };
    const output = toRecordTypeBody(input);
    expect(output).toBe(`{\n  key1: value1,\n}`);
  });

  it('should return multiple key-value pairs formatted correctly', () => {
    const input = { key1: 'value1', key2: 'value2' };
    const output = toRecordTypeBody(input);
    expect(output).toBe(`{\n  key1: value1,\n  key2: value2,\n}`);
  });

  it('should handle complex values in the record', () => {
    const input = { key1: '123', key2: '"some string"' };
    const output = toRecordTypeBody(input);
    expect(output).toBe(`{\n  key1: 123,\n  key2: "some string",\n}`);
  });

  it('should handle special characters in keys and values', () => {
    const input = { 'key-1': 'value_1', 'key 2': 'value 2' };
    const output = toRecordTypeBody(input);
    expect(output).toBe(`{\n  key-1: value_1,\n  key 2: value 2,\n}`);
  });
});

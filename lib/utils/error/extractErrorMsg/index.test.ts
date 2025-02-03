import { describe, expect, it, vi } from 'vitest';

import { attempt } from '../../attempt';
import * as attemptModule from '../../attempt';
import { extractErrorMsg } from '.';

vi.spyOn(attemptModule, 'attempt').mockImplementation((fn, fallback) => {
  try {
    return fn();
  } catch {
    return fallback;
  }
});

describe('extractErrorMsg', () => {
  it('should return the error message if the input is a string', () => {
    const errorMessage = 'An error occurred';
    expect(extractErrorMsg(errorMessage)).toBe(errorMessage);
  });

  it('should return "Action rejected by User" for "user rejected action"', () => {
    const errorMessage = 'user rejected action';
    expect(extractErrorMsg(errorMessage)).toBe('Action rejected by User');
  });

  it('should return "Action rejected by User" for "user rejected"', () => {
    const errorMessage = 'user rejected';
    expect(extractErrorMsg(errorMessage)).toBe('Action rejected by User');
  });

  it('should return "Signature expired! Please adjust the time in your device." for "SignatureExpired"', () => {
    const errorMessage = 'SignatureExpired';
    expect(extractErrorMsg(errorMessage)).toBe(
      'Signature expired! Please adjust the time in your device.'
    );
  });

  it('should handle objects with a message property and extract recursively', () => {
    const errorObject = { message: 'Nested error message' };
    expect(extractErrorMsg(errorObject)).toBe('Nested error message');
  });

  it('should use attempt to stringify unknown error objects', () => {
    const unknownError = { code: 500, description: 'Internal Server Error' };
    vi.spyOn(JSON, 'stringify').mockImplementation(
      () => '{"code":500,"description":"Internal Server Error"}'
    );
    expect(extractErrorMsg(unknownError)).toBe(
      '{"code":500,"description":"Internal Server Error"}'
    );
    expect(attempt).toHaveBeenCalled();
  });

  it('should return an empty string if JSON.stringify fails', () => {
    const circularReference: Record<string, any> = {};
    circularReference['self'] = circularReference;

    vi.spyOn(JSON, 'stringify').mockImplementation(() => {
      throw new Error('circular structure');
    });

    expect(extractErrorMsg(circularReference)).toBe('');
  });

  it('should return an empty string if the input is null', () => {
    expect(extractErrorMsg(null)).toBe('');
  });

  it('should return an empty string if the input is undefined', () => {
    expect(extractErrorMsg(undefined)).toBe('');
  });

  it('should handle unknown input types gracefully', () => {
    expect(extractErrorMsg(42)).toBe('42');
    expect(extractErrorMsg(true)).toBe('true');
    expect(extractErrorMsg(Symbol('test'))).toBe('');
  });
});

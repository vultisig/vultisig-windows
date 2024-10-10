/**
 * Checks if a value is empty. A value is considered empty if it is undefined, null, an empty string, an empty array, or an object with no keys.
 *
 * @param {TValue | null | boolean | number | string | unknown[] | Record<string, unknown>} [value] - The value to check for emptiness.
 * @returns {boolean} True if the value is empty, false otherwise.
 */
export function isEmpty<TValue>(
  value?:
    | TValue
    | null
    | boolean
    | number
    | string
    | unknown[]
    | Record<string, unknown>
): value is TValue {
  if (value === undefined) return true;
  if (value === null) return true;

  if (typeof value === 'string' || Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }

  return false;
}

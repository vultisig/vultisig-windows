import { getRecordKeys } from '../getRecordKeys'

export function getRecordUnionValue<U>(value: U): U
export function getRecordUnionValue<U, K extends string>(
  value: U,
  key: K
): Extract<U, Record<K, unknown>>[K]
export function getRecordUnionValue<U, K extends string>(
  value: U,
  key?: K
): unknown {
  const keys = getRecordKeys(value as Record<string, unknown>)

  if (key === undefined) {
    // Return the entire union value when no key is provided
    return value
  }

  if (!keys.includes(key)) {
    throw new Error(`Key "${key}" not found in record union`)
  }

  return (value as Extract<U, Record<K, unknown>>)[key]
}

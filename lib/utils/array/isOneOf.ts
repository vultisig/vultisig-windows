export function isOneOf<T>(item: unknown, items: readonly T[]): item is T {
  return items.includes(item as T)
}

export const validateOneOf =
  <T>(options: readonly T[]) =>
  (value: T): void => {
    if (!isOneOf(value, options)) {
      throw new Error(`"${value}" is not one of: ${options.join(', ')}`)
    }
  }

export const safeJsonStringify = <T>(obj: T): any => {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (typeof obj === 'bigint') {
    return obj.toString()
  }

  if (Array.isArray(obj)) {
    return obj.map(safeJsonStringify)
  }

  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {}
    for (const key in obj) {
      const value = obj[key as keyof T]
      if (typeof value === 'bigint') {
        result[key] = value.toString()
      } else if (key === 'type' && value === 'eip1559') {
        result[key] = 2
      } else {
        result[key] = safeJsonStringify(value)
      }
    }
    return result
  }

  return obj
}

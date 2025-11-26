const isArray = (arr: any): arr is any[] => {
  return Array.isArray(arr)
}

const isObject = (obj: any): obj is Record<string, any> => {
  return obj === Object(obj) && !isArray(obj) && typeof obj !== 'function'
}

const toCamel = (value: string): string => {
  return value.replace(/([-_][a-z])/gi, $1 =>
    $1.toUpperCase().replace('-', '').replace('_', '')
  )
}

export const toCamelCase = <T>(obj: T): T => {
  if (isObject(obj)) {
    const result: Record<string, unknown> = {}

    Object.keys(obj).forEach(key => {
      const camelKey = toCamel(key)
      result[camelKey] = toCamelCase((obj as Record<string, unknown>)[key])
    })

    return result as T
  } else if (isArray(obj)) {
    return obj.map(item => toCamelCase(item)) as T
  }

  return obj
}

export function parseUrlSearchString<T extends Record<string, string>>(
  searchString: string
): T {
  const queryParams = new URLSearchParams(searchString)
  const paramsObject = {} as T

  queryParams.forEach((value, key) => {
    paramsObject[key as keyof T] = value as T[keyof T]
  })

  return paramsObject
}

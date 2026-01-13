export const getRecordKeys = <K extends string | number>(
  record: Partial<Record<K, unknown>>
): K[] => {
  return Object.keys(record) as K[]
}

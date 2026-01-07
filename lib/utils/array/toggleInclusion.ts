export const toggleInclusion = <T>(array: readonly T[], item: T): T[] => {
  return array.includes(item)
    ? array.filter(element => element !== item)
    : [...array, item]
}

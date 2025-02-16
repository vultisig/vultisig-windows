export const findBy = <T>(
  items: readonly T[],
  key: keyof T,
  value: T[keyof T],
): T[] | undefined => {
  return items.filter((item) => item[key] === value);
};

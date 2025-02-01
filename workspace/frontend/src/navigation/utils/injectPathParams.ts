export const injectPathParams = (
  path: string,
  params: Record<string, string>
) => {
  return Object.entries(params).reduce((acc, [key, value]) => {
    return acc.replace(`:${key}`, value);
  }, path);
};

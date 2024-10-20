export const addQueryParams = (
  baseUrl: string,
  params: Record<string, string | number | boolean>
) => {
  const query = Object.entries(params)
    .map(pair => pair.join('='))
    .join('&');

  return [baseUrl, query].join(baseUrl.includes('?') ? '&' : '?');
};

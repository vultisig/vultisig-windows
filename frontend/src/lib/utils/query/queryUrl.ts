import { assertFetchResponse } from '../fetch/assertFetchResponse';

export const queryUrl = async <T>(url: string | URL): Promise<T> => {
  const response = await fetch(url);

  await assertFetchResponse(response);

  return response.json();
};

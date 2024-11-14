import { assertFetchResponse } from '../fetch/assertFetchResponse';

export const queryUrl = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);

  await assertFetchResponse(response);

  return response.json();
};

export const queryUrlWindowsPlatform = async <T, R = undefined>(
  url: string,
  method?: string,
  body?: R
): Promise<T> => {
  const response = await fetch(url, {
    headers: {
      Platform: 'vulti-windows',
      Version: '0.2',
      'Content-Type': 'application/json',
    },
    method: method ? method : 'GET',
    body: body ? JSON.stringify(body) : undefined,
  });

  await assertFetchResponse(response);

  return response.json();
};

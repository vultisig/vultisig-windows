export const queryUrl = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
};

export const thorWalletQueryUrl = async <T, R = undefined>(
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
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }
  return response.json();
};

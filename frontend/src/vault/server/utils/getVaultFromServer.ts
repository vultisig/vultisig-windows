import { fastVaultServerUrl } from '../config';

type GetVaultFromServerInput = {
  password: string;
  vaultId: string;
};

export const getVaultFromServer = async ({
  password,
  vaultId,
}: GetVaultFromServerInput) => {
  const url = `${fastVaultServerUrl}/get/${vaultId}`;

  const response = await fetch(url, {
    headers: {
      'x-password': password,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
};

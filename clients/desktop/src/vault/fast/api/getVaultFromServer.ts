import { base64Encode } from '@lib/utils/base64Encode';
import { assertFetchResponse } from '@lib/utils/fetch/assertFetchResponse';

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
      'x-password': base64Encode(password),
    },
  });

  await assertFetchResponse(response);

  return response.json();
};

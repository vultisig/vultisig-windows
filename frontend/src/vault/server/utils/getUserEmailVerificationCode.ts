import { assertFetchResponse } from '../../../lib/utils/fetch/assertFetchResponse';

export type GetUserEmailVerificationCodeParams = {
  publicKeyECDSA: string;
  code: string;
};

export const getUserEmailVerificationCode = async ({
  publicKeyECDSA,
  code,
}: GetUserEmailVerificationCodeParams) => {
  const url = `/vault/verify/${encodeURIComponent(publicKeyECDSA)}/${encodeURIComponent(code)}`;

  const response = await fetch(url);
  await assertFetchResponse(response);
  return response.json();
};

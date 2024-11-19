export type ConfirmUserEmailVerificationCodeParams = {
  publicKeyECDSA: string;
  code: string;
};

export const confirmUserEmailVerificationCode = async ({
  publicKeyECDSA,
  code,
}: ConfirmUserEmailVerificationCodeParams) => {
  const url = `/vault/verify/${encodeURIComponent(publicKeyECDSA)}/${encodeURIComponent(code)}`;

  const response = await fetch(url);

  if (response.status !== 200) {
    throw new Error('failed_to_confirm_email_code');
  }

  return response;
};

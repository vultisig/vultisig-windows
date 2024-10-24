import { fastVaultServerUrl } from '../config';

type Input = {
  public_key: string;
  messages: string[];
  session_id: string;
  hex_encryption_key: string;
  derive_path: string;
  is_ecdsa: boolean;
  vault_password: string;
};

export const signWithServer = async (input: Input) => {
  const url = `${fastVaultServerUrl}/create`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response;
};

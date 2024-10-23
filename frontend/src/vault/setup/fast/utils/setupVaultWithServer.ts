import { Endpoint } from '../../../../services/Endpoint';

type Input = {
  name: string;
  session_id: string;
  hex_encryption_key: string;
  hex_chain_code: string;
  local_party_id: string;
  encryption_password: string;
  email: string;
};

export const setupVaultWithServer = async (input: Input) => {
  const response = await fetch(`${Endpoint.vultisigApiProxy}/vault/create`, {
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

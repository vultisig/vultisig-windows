import { keygenServerUrl } from '../../keygen/KeygenServerType';

type UploadPayloadToServerInput = {
  hash: string;
};

export async function getPayloadFromServer({
  hash,
}: UploadPayloadToServerInput): Promise<string> {
  const url = `${keygenServerUrl.relay}/payload/${hash}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to get payload from server');
  }

  return response.text();
}

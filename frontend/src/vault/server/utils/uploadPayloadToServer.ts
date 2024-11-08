import crypto from 'crypto';

import { keygenServerUrl } from '../../keygen/KeygenServerType';

type UploadPayloadToServerInput = {
  payload: string;
};

export async function uploadPayloadToServer({
  payload,
}: UploadPayloadToServerInput): Promise<string> {
  const hash = crypto.createHash('sha256').update(payload).digest('hex');
  const url = `${keygenServerUrl.relay}/payload/${hash}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: payload,
  });

  if (!response.ok) {
    throw new Error('Failed to upload payload to server');
  }

  return hash;
}

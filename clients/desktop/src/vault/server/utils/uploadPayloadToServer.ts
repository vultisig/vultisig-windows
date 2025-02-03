import crypto from 'crypto';

import { assertFetchResponse } from '@lib/utils/fetch/assertFetchResponse';

type UploadPayloadToServerInput = {
  serverUrl: string;
  payload: string;
};

export async function uploadPayloadToServer({
  payload,
  serverUrl,
}: UploadPayloadToServerInput): Promise<string> {
  const hash = crypto.createHash('sha256').update(payload).digest('hex');
  const url = `${serverUrl}/payload/${hash}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: payload,
  });

  await assertFetchResponse(response);

  return hash;
}

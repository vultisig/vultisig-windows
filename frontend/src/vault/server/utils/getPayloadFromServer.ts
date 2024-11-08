type UploadPayloadToServerInput = {
  serverUrl: string;
  hash: string;
};

export async function getPayloadFromServer({
  hash,
  serverUrl,
}: UploadPayloadToServerInput): Promise<string> {
  const url = `${serverUrl}/payload/${hash}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to get payload from server');
  }

  return response.text();
}

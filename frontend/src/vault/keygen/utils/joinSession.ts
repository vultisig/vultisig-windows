type JoinSessionInput = {
  serverUrl: string;
  sessionId: string;
  localPartyId: string;
};

export const joinSession = async ({
  serverUrl,
  sessionId,
  localPartyId,
}: JoinSessionInput) => {
  const response = await fetch(`${serverUrl}/${sessionId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([localPartyId]),
  });

  if (!response.ok) {
    throw new Error('Failed to join session');
  }
};

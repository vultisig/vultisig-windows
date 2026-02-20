const defaultRelayUrl = 'https://api.vultisig.com/router'

export async function registerSession(
  relayUrl: string = defaultRelayUrl,
  sessionId: string,
  partyId: string
): Promise<void> {
  const resp = await fetch(`${relayUrl}/${sessionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([partyId]),
  })
  if (!resp.ok) {
    const body = await resp.text()
    throw new Error(`registerSession failed (${resp.status}): ${body}`)
  }
}

async function getSession(
  relayUrl: string = defaultRelayUrl,
  sessionId: string
): Promise<string[]> {
  const resp = await fetch(`${relayUrl}/${sessionId}`)
  if (!resp.ok) {
    const body = await resp.text()
    throw new Error(`getSession failed (${resp.status}): ${body}`)
  }
  return resp.json()
}

export async function startSession(
  relayUrl: string = defaultRelayUrl,
  sessionId: string,
  parties: string[]
): Promise<void> {
  const resp = await fetch(`${relayUrl}/start/${sessionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parties),
  })
  if (!resp.ok) {
    const body = await resp.text()
    throw new Error(`startSession failed (${resp.status}): ${body}`)
  }
}

export async function waitForParties(
  relayUrl: string = defaultRelayUrl,
  sessionId: string,
  expected: number,
  timeoutMs: number = 120_000
): Promise<string[]> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const parties = await getSession(relayUrl, sessionId)
      if (parties.length >= expected) {
        return parties
      }
    } catch {
      // ignore polling errors
    }
    await new Promise(r => setTimeout(r, 1000))
  }
  throw new Error(
    `Timeout waiting for ${expected} parties in session ${sessionId}`
  )
}

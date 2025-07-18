import { queryUrl } from '@lib/utils/query/queryUrl'
import { retry } from '@lib/utils/query/retry'

type SetKeygenCompleteInput = {
  serverURL: string
  sessionId: string
  localPartyId: string
}
export const setKeygenComplete = async ({
  serverURL,
  sessionId,
  localPartyId,
}: SetKeygenCompleteInput): Promise<void> => {
  await queryUrl(`${serverURL}/complete/${sessionId}`, {
    body: [localPartyId],
    responseType: 'none',
  })
}

type WaitKeygenCompleteInput = {
  serverURL: string
  sessionId: string
  peers: string[]
}

const verifyKeygenComplete = async ({
  serverURL,
  sessionId,
  peers,
}: WaitKeygenCompleteInput) => {
  const completePeers = await queryUrl<string[]>(
    `${serverURL}/complete/${sessionId}`
  )

  // Check whether all items in peers exist in completePeers
  const allPeersComplete = peers.every(peer => completePeers.includes(peer))
  if (!allPeersComplete) {
    throw new Error('not all parties done keygen')
  }
}

export const waitForKeygenComplete = async ({
  serverURL,
  sessionId,
  peers,
}: WaitKeygenCompleteInput) =>
  retry({
    func: () => verifyKeygenComplete({ serverURL, sessionId, peers }),
    attempts: 10,
    delay: 1000,
  })

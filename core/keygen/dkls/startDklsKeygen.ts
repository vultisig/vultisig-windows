import __wbg_init, { KeygenSession } from '../../../lib/dkls/vs_wasm'
import { initSetupMessage } from './initSetupMessage'

type StartDklsKeygenInput = {
  isInitiatingDevice: boolean
  peers: string[]
  sessionId: string
  hexEncryptionKey: string
  serverUrl: string
  localPartyId: string
}

export const startDklsKeygen = async ({
  isInitiatingDevice,
  peers,
  hexEncryptionKey,
  serverUrl,
  sessionId,
  localPartyId,
}: StartDklsKeygenInput) => {
  await __wbg_init()

  const setupMessage = await initSetupMessage({
    isInitiatingDevice,
    peers,
    hexEncryptionKey,
    serverUrl,
    sessionId,
    localPartyId,
  })

  const keygenSession = new KeygenSession(setupMessage, localPartyId)

  console.log('keygenSession', keygenSession)
}

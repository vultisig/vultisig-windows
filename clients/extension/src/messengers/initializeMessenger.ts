import { bridgeMessenger } from './bridge'
import { detectScriptType, ScriptType } from './detectScriptType'
import { extensionMessenger } from './extension'
import { tabMessenger } from './tab'
import { windowMessenger } from './window'

const messengersForConnection = {
  'popup <-> inpage': bridgeMessenger,
  'background <-> inpage': bridgeMessenger,
  'background <-> popup': extensionMessenger,
  'popup <-> contentScript': tabMessenger,
  'background <-> contentScript': tabMessenger,
  'contentScript <-> inpage': windowMessenger,
} as const

type InitializeMessengerArgs = {
  /** The script type we want to set a connection for. */
  connect: ScriptType
}

export function initializeMessenger({ connect }: InitializeMessengerArgs) {
  const source = detectScriptType()
  const connections = [
    `${source} <-> ${connect}`,
    `${connect} <-> ${source}`,
  ] as (keyof typeof messengersForConnection)[]
  const connection = connections.find(c => c in messengersForConnection)
  if (!connection)
    throw new Error(
      `No messenger found for connection ${source} <-> ${connect}.`
    )
  return messengersForConnection[connection]
}

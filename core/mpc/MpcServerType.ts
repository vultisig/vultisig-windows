import { rootApiUrl } from '@core/config'

// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __RELAY_URL__: string | undefined

export const mpcServerTypes = ['relay', 'local'] as const

export type MpcServerType = (typeof mpcServerTypes)[number]

const relayUrlOverride =
  typeof __RELAY_URL__ !== 'undefined' && __RELAY_URL__ !== ''
    ? __RELAY_URL__
    : null

export const mpcServerUrl: Record<MpcServerType, string> = {
  relay: relayUrlOverride ?? `${rootApiUrl}/router`,
  local: 'http://127.0.0.1:18080',
}

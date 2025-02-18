import { rootApiUrl } from '@core/config'

export const keygenServerTypes = ['relay', 'local'] as const

export type KeygenServerType = (typeof keygenServerTypes)[number]

export const keygenServerUrl: Record<KeygenServerType, string> = {
  relay: `${rootApiUrl}/router`,
  local: 'http://127.0.0.1:18080',
}

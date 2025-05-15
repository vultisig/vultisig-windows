import { MpcServerType, mpcServerUrl } from '@core/mpc/MpcServerType'

import { DiscoveryService } from '../../../../../wailsjs/go/mediator/Server'

export type GetMpcServerUrlInput = {
  serverType: MpcServerType
  serviceName: string
}

export const getMpcServerUrl = async ({
  serverType,
  serviceName,
}: GetMpcServerUrlInput): Promise<string> => {
  if (serverType === 'relay') {
    return mpcServerUrl.relay
  }

  return DiscoveryService(serviceName)
}

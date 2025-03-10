import { MpcServerType, mpcServerUrl } from '@core/mpc/MpcServerType'

import { DiscoveryService } from '../../../../../wailsjs/go/mediator/Server'

export type GetKeygenServerUrlInput = {
  serverType: MpcServerType
  serviceName: string
}

export const getKeygenServerUrl = async ({
  serverType,
  serviceName,
}: GetKeygenServerUrlInput): Promise<string> => {
  if (serverType === 'relay') {
    return mpcServerUrl.relay
  }

  return DiscoveryService(serviceName)
}

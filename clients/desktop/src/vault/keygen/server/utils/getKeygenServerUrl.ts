import { DiscoveryService } from '../../../../../wailsjs/go/mediator/Server';
import { KeygenServerType, keygenServerUrl } from '../KeygenServerType';

export type GetKeygenServerUrlInput = {
  serverType: KeygenServerType;
  serviceName: string;
};

export const getKeygenServerUrl = async ({
  serverType,
  serviceName,
}: GetKeygenServerUrlInput): Promise<string> => {
  if (serverType === 'relay') {
    return keygenServerUrl.relay;
  }

  return DiscoveryService(serviceName);
};

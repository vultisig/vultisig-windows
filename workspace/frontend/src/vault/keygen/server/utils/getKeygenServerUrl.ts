import { DiscoveryService } from '../../../../../wailsjs/go/mediator/Server';
import { Endpoint } from '../../../../services/Endpoint';
import { KeygenServerType } from '../KeygenServerType';

export type GetKeygenServerUrlInput = {
  serverType: KeygenServerType;
  serviceName: string;
};

export const getKeygenServerUrl = async ({
  serverType,
  serviceName,
}: GetKeygenServerUrlInput): Promise<string> => {
  if (serverType === 'relay') {
    return Endpoint.VULTISIG_RELAY;
  }

  return DiscoveryService(serviceName);
};

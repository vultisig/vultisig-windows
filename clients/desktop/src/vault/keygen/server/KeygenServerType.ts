import { Endpoint } from '../../../services/Endpoint';

export const keygenServerTypes = ['relay', 'local'] as const;

export type KeygenServerType = (typeof keygenServerTypes)[number];

export const keygenServerUrl: Record<KeygenServerType, string> = {
  relay: Endpoint.VULTISIG_RELAY,
  local: Endpoint.LOCAL_MEDIATOR_URL,
};

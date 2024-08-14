import { Chain } from '../../model/chain';

export interface IAddressService {
  resolveDomainAddress(address: string, chain: Chain): Promise<string>;
  validateAddress(address: string, chain: Chain): boolean; // Each chain validates different things, so this method should be implemented in each service
}

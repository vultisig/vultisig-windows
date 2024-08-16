/* eslint-disable */
import { Chain } from '../../../model/chain';
import { IRpcService } from '../../Rpc/IRpcService';
import { RpcServiceFactory } from '../../Rpc/RpcServiceFactory';
import { AddressService } from '../AddressService';
import { IAddressService } from '../IAddressService';

export class AddressServiceEvm
  extends AddressService
  implements IAddressService
{
  private rpcServiceFactory: IRpcService;

  constructor(chain: Chain) {
    super(chain);
    this.rpcServiceFactory = RpcServiceFactory.createRpcService(chain);
  }

  async resolveDomainAddress(address: string): Promise<string> {
    try {
      // Check if the address is a name service domain
      if (!address.isNameService()) {
        return address;
      }

      const ensName = address;
      const namehash = ensName.namehash();
      console.log(`Namehash for ${ensName}: ${namehash}`);

      const resolvedAddress =
        this.rpcServiceFactory?.resolveENS?.(ensName) || '';

      console.log(`Resolved address ${resolvedAddress}`);

      return resolvedAddress;
    } catch (error) {
      console.error(`Error to extract the DOMAIN ADDRESS: ${error}`);
      return address;
    }
  }
}

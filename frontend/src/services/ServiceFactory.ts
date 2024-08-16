import { Chain } from '../model/chain';
import { AddressServiceFactory } from './Address/AddressServiceFactory';
import { CoinServiceFactory } from './Coin/CoinServiceFactory';
import { IService } from './IService';
import { RpcServiceFactory } from './Rpc/RpcServiceFactory';
import { SendServiceFactory } from './Send/SendServiceFactory';
import { Service } from './Service';

export class ServiceFactory {
  static getService(chain: Chain): IService {
    const rpcService = RpcServiceFactory.createRpcService(chain);
    const addressService = AddressServiceFactory.createAddressService(chain);
    const coinService = CoinServiceFactory.createCoinService(chain);
    const keygenService = null; // I need to understand how it works and is used
    const sendService = SendServiceFactory.createSendService(chain);

    return new Service(
      rpcService,
      addressService,
      coinService,
      keygenService,
      sendService
    );
  }
}

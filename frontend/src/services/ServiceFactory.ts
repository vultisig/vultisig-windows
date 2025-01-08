import { WalletCore } from '@trustwallet/wallet-core';

import { Chain } from '../model/chain';
import { CoinServiceFactory } from './Coin/CoinServiceFactory';
import { IService } from './IService';
import { PriceServiceFactory } from './Price/PriceServiceFactory';
import { RpcServiceFactory } from './Rpc/RpcServiceFactory';
import { Service } from './Service';

export class ServiceFactory {
  static getService(chain: Chain, walletCore: WalletCore): IService {
    const rpcService = RpcServiceFactory.createRpcService(chain);
    const coinService = CoinServiceFactory.createCoinService(chain, walletCore);

    const priceService = PriceServiceFactory.createPriceService(chain);

    return new Service(rpcService, coinService, priceService);
  }
}

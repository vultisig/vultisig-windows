import { WalletCore } from '@trustwallet/wallet-core';
import { Chain } from '../model/chain';
import { AddressServiceFactory } from './Address/AddressServiceFactory';
import { CoinServiceFactory } from './Coin/CoinServiceFactory';
import { IService } from './IService';
import { RpcServiceFactory } from './Rpc/RpcServiceFactory';
import { SendServiceFactory } from './Send/SendServiceFactory';
import { Service } from './Service';
import { BalanceServiceFactory } from './Balance/BalanceServiceFactory';
import { PriceServiceFactory } from './Price/PriceServiceFactory';
import { FeeServiceFactory } from './Fee/FeeServiceFactory';

export class ServiceFactory {
  static getService(chain: Chain, walletCore: WalletCore): IService {
    const rpcService = RpcServiceFactory.createRpcService(chain);
    const addressService = AddressServiceFactory.createAddressService(
      chain,
      walletCore
    );
    const coinService = CoinServiceFactory.createCoinService(chain, walletCore);
    const keygenService = null; // I need to understand how it works and is used
    const sendService = SendServiceFactory.createSendService(chain, walletCore);
    const balanceService = BalanceServiceFactory.createBalanceService(chain);
    const priceService = PriceServiceFactory.createPriceService(
      chain,
      walletCore
    );
    const feeService = FeeServiceFactory.createFeeService(chain, walletCore);

    return new Service(
      rpcService,
      addressService,
      coinService,
      keygenService,
      sendService,
      balanceService,
      priceService,
      feeService
    );
  }
}

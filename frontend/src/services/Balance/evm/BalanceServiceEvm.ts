import { Chain } from '../../../model/chain';
import { Balance } from '../../../model/balance';
import { RpcServiceFactory } from '../../Rpc/RpcServiceFactory';
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { IBalanceService } from '../IBalanceService';

export class BalanceServiceEvm implements IBalanceService {
  chain: Chain;
  constructor(chain: Chain) {
    this.chain = chain;
  }

  async getBalance(coin: Coin): Promise<Balance> {
    const rpcService = RpcServiceFactory.createRpcService(this.chain);

    const balance: string = await rpcService.getBalance(coin);

    return {
      address: coin.address,
      contractAddress: coin.contractAddress,
      chain: this.chain,
      rawAmount: parseInt(balance),
    };
  }
}

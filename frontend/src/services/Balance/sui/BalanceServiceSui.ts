import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { Balance } from '../../../model/balance';
import { Chain } from '../../../model/chain';
import { RpcServiceFactory } from '../../Rpc/RpcServiceFactory';
import { IBalanceService } from '../IBalanceService';

export class BalanceServiceSui implements IBalanceService {
  private chain: Chain;

  constructor(chain: Chain) {
    this.chain = chain;
  }

  async getBalance(coin: Coin): Promise<Balance> {
    const rpcService = RpcServiceFactory.createRpcService(this.chain);
    const balance = await rpcService.getBalance(coin);

    const fetchedBalance: Balance = {
      address: coin.address,
      contractAddress: coin.contractAddress,
      chain: this.chain,
      rawAmount: parseInt(balance),
      decimalAmount: parseInt(balance) / Math.pow(10, coin.decimals),
      expiryDate: new Date(Date.now() + 60000 * 60), // 60 minute expiry
    };

    return fetchedBalance;
  }
}

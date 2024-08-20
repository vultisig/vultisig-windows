import { Chain } from '../../model/chain';
import { Balance } from '../../model/balance';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { IBalanceService } from './IBalanceService';

export class BalanceService implements IBalanceService {
  chain: Chain;
  constructor(chain: Chain) {
    this.chain = chain;
  }

  async getBalance(coin: Coin): Promise<Balance> {
    // TODO: Implement this
    return {
      address: coin.address,
      contractAddress: coin.contractAddress,
      chain: this.chain,
      rawAmount: 0,
    };
  }
}

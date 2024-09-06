import { Chain } from '../../model/chain';
import { Balance } from '../../model/balance';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { IBalanceService } from './IBalanceService';

export class BalanceService implements IBalanceService {
  private chain: Chain;

  constructor(chain: Chain) {
    this.chain = chain;
  }

  async getBalance(coin: Coin): Promise<Balance> {
    // TODO: Implement this
    const fetchedBalance: Balance = {
      address: coin.address,
      contractAddress: coin.contractAddress,
      chain: this.chain,
      rawAmount: 0,
      decimalAmount: 0,
      expiryDate: new Date(Date.now() + 60000 * 60), // 60 minute expiry
    };

    if (fetchedBalance.rawAmount === 0) {
      // If the balance is 0, return the fetched balance
      return fetchedBalance;
    }

    return fetchedBalance;
  }
}

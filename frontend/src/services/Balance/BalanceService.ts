import { Chain } from '../../model/chain';
import { Balance } from '../../model/balance';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { IBalanceService } from './IBalanceService';
import { StorageService, StoreName } from '../Storage/StorageService';

export class BalanceService implements IBalanceService {
  private chain: Chain;
  private storageService: StorageService<Balance>;

  constructor(chain: Chain) {
    this.chain = chain;
    this.storageService = new StorageService<Balance>(StoreName.BALANCE);
  }

  async getBalance(coin: Coin): Promise<Balance> {
    const cacheKey = JSON.stringify(coin);

    // Check the cache first
    const cachedBalance = await this.storageService.getFromStorage(cacheKey);
    if (cachedBalance) {
      // If the cache is not expired, return the cached balance
      cachedBalance.expiryDate = new Date(cachedBalance.expiryDate);
      if (cachedBalance.expiryDate < new Date()) {
        return cachedBalance;
      }
    }

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

    // Cache the fetched balance
    await this.storageService.saveToStorage(cacheKey, fetchedBalance);

    return fetchedBalance;
  }
}
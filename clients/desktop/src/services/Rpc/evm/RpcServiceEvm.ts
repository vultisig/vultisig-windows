import { ethers } from 'ethers';

import { getEvmChainRpcUrl } from '../../../chain/evm/chainInfo';
import { getErc20Balance } from '../../../chain/evm/erc20/getErc20Balance';
import { FeePriority } from '../../../chain/fee/FeePriority';
import { Coin } from '@core/communication/vultisig/keysign/v1/coin_pb';
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg';
import { EvmChain } from '../../../model/chain';
import { IRpcService } from '../IRpcService';

export class RpcServiceEvm implements IRpcService {
  provider: ethers.JsonRpcProvider;
  chain: EvmChain;

  constructor(chain: EvmChain) {
    this.chain = chain;
    this.provider = new ethers.JsonRpcProvider(getEvmChainRpcUrl(chain));
  }

  async getBalance(coin: Coin): Promise<string> {
    const balance = coin.isNativeToken
      ? await this.provider.getBalance(coin.address)
      : await getErc20Balance({
          chain: this.chain,
          address: coin.contractAddress as `0x${string}`,
          accountAddress: coin.address as `0x${string}`,
        });

    return balance.toString();
  }

  async fetchMaxPriorityFeesPerGas(): Promise<Record<FeePriority, number>> {
    try {
      const history = await this.getGasHistory();

      // If history is empty, fetch a single max priority fee and use it for all modes
      if (history.length === 0) {
        const value = await this.provider.send('eth_maxPriorityFeePerGas', []);
        return {
          fast: value,
          low: value,
          normal: value,
        };
      }

      // Calculate low, normal, and fast fees
      const low = history[0];
      const normal = history[Math.floor(history.length / 2)];
      const fast = history[history.length - 1];

      // Return mapped fees
      return {
        low,
        normal,
        fast,
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch max priority fees per gas ${extractErrorMsg(error)}`
      );
    }
  }

  async getGasHistory(): Promise<number[]> {
    try {
      // Send the RPC request for fee history
      const gasHistory = await this.provider.send('eth_feeHistory', [
        10,
        'latest',
        [5],
      ]);

      // Ensure the response has a valid structure
      if (!gasHistory || !gasHistory.reward) {
        throw new Error('Invalid response from eth_feeHistory');
      }

      // Extract and process the reward array
      const rewards: string[][] = gasHistory.reward;
      const rewardValues = rewards
        .map(reward => reward[0]) // Take the first element from each array
        .filter(Boolean) // Filter out any undefined or null values
        .map(reward => parseInt(reward.replace(/^0x/, ''), 16)) // Convert hex to decimal
        .sort((a, b) => a - b); // Sort the values in ascending order

      return rewardValues;
    } catch (error) {
      console.error('getGasHistory::', error);
      return [];
    }
  }
}

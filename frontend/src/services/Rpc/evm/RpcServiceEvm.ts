import { ethers, TransactionRequest } from 'ethers';

import { getEvmChainRpcUrl } from '../../../chain/evm/chainInfo';
import { getErc20Balance } from '../../../chain/evm/erc20/getErc20Balance';
import { FeePriority } from '../../../chain/fee/FeePriority';
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { extractErrorMsg } from '../../../lib/utils/error/extractErrorMsg';
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

  async estimateGas(
    senderAddress: string,
    recipientAddress: string,
    value: bigint,
    memo?: string
  ): Promise<bigint> {
    try {
      const transactionObject: TransactionRequest = {
        from: senderAddress,
        to: recipientAddress,
        value: value,
        data: memo ? ethers.hexlify(ethers.toUtf8Bytes(memo)) : '0x',
      };

      const gasEstimate = await this.provider.estimateGas(transactionObject);
      return BigInt(gasEstimate.toString());
    } catch (error) {
      console.error('estimateGas::', error);
      return BigInt(0);
    }
  }

  async getTokenInfo(
    contractAddress: string
  ): Promise<{ name: string; symbol: string; decimals: number }> {
    try {
      const erc20Contract = new ethers.Contract(
        contractAddress,
        [
          'function name() view returns (string)',
          'function symbol() view returns (string)',
          'function decimals() view returns (uint8)',
        ],
        this.provider
      );

      const [name, symbol, decimals] = await Promise.all([
        erc20Contract.name(),
        erc20Contract.symbol(),
        erc20Contract.decimals(),
      ]);

      return { name, symbol, decimals: decimals };
    } catch (error) {
      console.error('getTokenInfo::', error);
      return { name: '', symbol: '', decimals: 0 };
    }
  }

  sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private constructERC20TransferData(
    recipientAddress: string,
    value: bigint
  ): string {
    const methodId = 'a9059cbb'; // Method ID for `transfer(address,uint256)`

    const strippedRecipientAddress = recipientAddress.replace(/^0x/, '');
    const paddedAddress = strippedRecipientAddress.padStart(64, '0');

    const valueHex = value.toString(16);
    const paddedValue = valueHex.padStart(64, '0');

    return '0x' + methodId + paddedAddress + paddedValue;
  }
}

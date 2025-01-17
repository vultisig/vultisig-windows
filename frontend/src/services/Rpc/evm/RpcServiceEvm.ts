import { ethers, TransactionRequest } from 'ethers';

import { Fetch } from '../../../../wailsjs/go/utils/GoHttp';
import {
  getEvmChainId,
  getEvmChainRpcUrl,
  getEvmPublicClient,
} from '../../../chain/evm/chainInfo';
import { getErc20Balance } from '../../../chain/evm/erc20/getErc20Balance';
import { FeePriority } from '../../../chain/fee/FeePriority';
import { oneInchTokenToCoinMeta } from '../../../coin/oneInch/token';
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { isOneOf } from '../../../lib/utils/array/isOneOf';
import { extractErrorMsg } from '../../../lib/utils/error/extractErrorMsg';
import { areLowerCaseEqual } from '../../../lib/utils/string/areLowerCaseEqual';
import { Chain, EvmChain } from '../../../model/chain';
import { CoinMeta } from '../../../model/coin-meta';
import { Endpoint } from '../../Endpoint';
import { ITokenService } from '../../Tokens/ITokenService';
import { IRpcService } from '../IRpcService';

export class RpcServiceEvm implements IRpcService, ITokenService {
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

  async broadcastTransaction(
    encodedTransaction: string
  ): Promise<string | null> {
    const publicClient = getEvmPublicClient(this.chain as EvmChain);

    try {
      const hash = await publicClient.sendRawTransaction({
        serializedTransaction: encodedTransaction as `0x${string}`,
      });
      return hash;
    } catch (error) {
      // Common errors when transaction was already broadcast
      const alreadyBroadcastErrors = [
        'already known',
        'transaction is temporarily banned',
        'nonce too low',
        'transaction already exists',
      ];

      const errorMessage = extractErrorMsg(error);
      const isAlreadyBroadcast = alreadyBroadcastErrors.some(msg =>
        areLowerCaseEqual(msg, errorMessage)
      );

      if (isAlreadyBroadcast) {
        return null;
      }

      throw error;
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

  async getTokens(nativeToken: Coin): Promise<CoinMeta[]> {
    try {
      const chain = isOneOf(nativeToken.chain, Object.values(Chain));

      if (!chain) {
        throw new Error('Invalid chain');
      }

      const oneInchChainId = getEvmChainId(chain as EvmChain);
      const oneInchEndpoint = Endpoint.fetch1InchsTokensBalance(
        oneInchChainId.toString(),
        nativeToken.address
      );

      const balanceData = await Fetch(oneInchEndpoint);

      await this.sleep(1000); // We have some rate limits on 1 inch, so I will wait a bit

      // Filter tokens with non-zero balance
      const nonZeroBalanceTokenAddresses = Object.entries(balanceData)
        .filter(([_, balance]) => BigInt(balance as string) > 0n) // Ensure the balance is non-zero
        .map(([tokenAddress]) => tokenAddress)
        .filter(
          tokenAddress =>
            tokenAddress !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
        );

      if (nonZeroBalanceTokenAddresses.length === 0) {
        return [];
      }

      // Fetch token information for the non-zero balance tokens
      const tokenInfoEndpoint = Endpoint.fetch1InchsTokensInfo(
        oneInchChainId.toString(),
        nonZeroBalanceTokenAddresses
      );

      const tokenInfoData = await Fetch(tokenInfoEndpoint);

      // Map the fetched token information to CoinMeta[] format
      return nonZeroBalanceTokenAddresses
        .map(tokenAddress => {
          const tokenInfo = tokenInfoData[tokenAddress];
          if (!tokenInfo) return null;

          return oneInchTokenToCoinMeta({
            token: tokenInfo,
            chain: chain,
          });
        })
        .filter((token): token is CoinMeta => token !== null); // Type guard to filter out null values
    } catch (error) {
      console.error('getTokens::', error);
      return [];
    }
  }

  async estimateGasForERC20Transfer(
    senderAddress: string,
    contractAddress: string,
    recipientAddress: string,
    value: bigint
  ): Promise<bigint> {
    const data = this.constructERC20TransferData(recipientAddress, value);

    const nonce = await this.provider.getTransactionCount(senderAddress);
    const gasPrice = await this.provider.send('eth_gasPrice', []);

    const transactionObject: ethers.TransactionRequest = {
      from: senderAddress,
      to: contractAddress,
      value: '0x0',
      data: data,
      nonce: nonce,
      gasPrice: gasPrice,
    };

    const gasEstimate = await this.provider.estimateGas(transactionObject);
    return BigInt(gasEstimate.toString());
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

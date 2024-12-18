import { ethers, TransactionRequest } from 'ethers';

import { Fetch, Post } from '../../../../wailsjs/go/utils/GoHttp';
import { evmRpcUrl } from '../../../chain/evm/evmRpcUrl';
import { EvmFeeSettings } from '../../../chain/evm/fee/EvmFeeSettings';
import { getEvmBaseFee } from '../../../chain/evm/utils/getEvmBaseFee';
import { getEvmGasLimit } from '../../../chain/evm/utils/getEvmGasLimit';
import {
  defaultFeePriority,
  FeePriority,
} from '../../../chain/fee/FeePriority';
import { gwei } from '../../../chain/tx/fee/utils/evm';
import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { oneInchTokenToCoinMeta } from '../../../coin/oneInch/token';
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { extractErrorMsg } from '../../../lib/utils/error/extractErrorMsg';
import { ChainUtils, EvmChain, evmChainIds } from '../../../model/chain';
import { CoinMeta } from '../../../model/coin-meta';
import { SpecificEvm } from '../../../model/specific-transaction-info';
import { Endpoint } from '../../Endpoint';
import { ITokenService } from '../../Tokens/ITokenService';
import { IRpcService } from '../IRpcService';

export class RpcServiceEvm implements IRpcService, ITokenService {
  provider: ethers.JsonRpcProvider;
  chain: EvmChain;

  constructor(chain: EvmChain) {
    this.chain = chain;
    this.provider = new ethers.JsonRpcProvider(evmRpcUrl[chain]);
  }

  async sendTransaction(encodedTransaction: string): Promise<string> {
    const knownErrors = [
      'already known',
      'Transaction is temporarily banned',
      'nonce too low',
      'nonce too high',
      'transaction already exists',
    ];

    try {
      const payload = {
        jsonrpc: '2.0',
        method: 'eth_sendRawTransaction',
        params: [encodedTransaction],
        id: 1,
      };

      // We are having a lot of cors issues, so we are using the Go server to send the transaction
      const response = await Post(evmRpcUrl[this.chain], payload);

      if (response && response.result) {
        return response.result;
      } else {
        // Handle JSON-RPC error case
        const errorMessage =
          response.error?.message || 'Unknown error occurred';
        const isKnownError = knownErrors.some(msg =>
          errorMessage.includes(msg)
        );

        if (isKnownError) {
          return 'Transaction already broadcasted.';
        }

        return errorMessage;
      }
    } catch (error: any) {
      console.error('sendTransaction::', error);
      const isKnownError = knownErrors.some(msg =>
        error?.message?.includes(msg)
      );

      if (isKnownError) {
        return 'Transaction already broadcasted.';
      }

      return error.message || 'Unknown error occurred';
    }
  }

  async resolveENS(ensName: string): Promise<string> {
    try {
      const address = await this.provider.resolveName(ensName);
      if (!address)
        throw new Error('ENS  ' + ensName + ' namecould not be resolved.');
      return address;
    } catch (error) {
      console.error('resolveENS::', error);
      return '';
    }
  }

  async fetchTokenBalance(
    contractAddress: string,
    walletAddress: string
  ): Promise<bigint> {
    try {
      const balance = await this.fetchERC20TokenBalance(
        contractAddress,
        walletAddress
      );
      return BigInt(balance);
    } catch (error) {
      console.error('fetchTokenBalance::', error);
      return BigInt(0);
    }
  }

  async getBalance(coin: Coin): Promise<string> {
    try {
      if (coin.isNativeToken) {
        const balance = await this.provider.getBalance(coin.address);
        const strBalance = balance.toString();
        return strBalance;
      } else {
        return await this.fetchERC20TokenBalance(
          coin.contractAddress,
          coin.address
        );
      }
    } catch (error) {
      console.error(evmRpcUrl[this.chain], 'getBalance::', error);
      return '0';
    }
  }

  normalizeFee(value: number): number {
    return value + value / 2; // x1.5 fee
  }

  async getSpecificTransactionInfo(
    coin: Coin,
    _receiver: string,
    feeSettings?: EvmFeeSettings
  ): Promise<SpecificEvm> {
    const [gasPrice, nonce] = await Promise.all([
      this.provider.send('eth_gasPrice', []),
      this.provider.getTransactionCount(coin.address),
    ]);

    const gasLimit =
      feeSettings?.gasLimit ??
      getEvmGasLimit({
        chain: this.chain,
        isNativeToken: coin.isNativeToken,
      });

    const baseFee = await getEvmBaseFee(this.chain);
    const priorityFeeMapValue = await this.fetchMaxPriorityFeesPerGas();
    const feePriority = feeSettings?.priority ?? defaultFeePriority;
    const priorityFee = priorityFeeMapValue[feePriority];
    const normalizedBaseFee = this.normalizeFee(Number(baseFee));
    const maxFeePerGasWei = Number(
      BigInt(Math.round(normalizedBaseFee + priorityFee))
    );

    return {
      fee: maxFeePerGasWei * gasLimit,
      gasPrice: fromChainAmount(Number(gasPrice), gwei.decimals),
      nonce,
      priorityFee,
      priorityFeeWei: priorityFee,
      gasLimit,
      maxFeePerGasWei: maxFeePerGasWei,
    } as SpecificEvm;
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

  async broadcastTransaction(encodedTransaction: string): Promise<string> {
    return this.sendTransaction(encodedTransaction);
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

  async fetchERC20TokenBalance(
    contractAddress: string,
    walletAddress: string
  ): Promise<string> {
    try {
      const erc20Contract = new ethers.Contract(
        contractAddress,
        ['function balanceOf(address) view returns (uint256)'],
        this.provider
      );

      const balance = await erc20Contract.balanceOf(walletAddress);

      // Check if the balance is an empty response
      if (!balance || balance.toString() === '0x') {
        return '0';
      }

      return balance.toString();
    } catch (error) {
      console.error(
        'fetchERC20TokenBalance::',
        walletAddress,
        contractAddress,
        error
      );

      return '0';
    }
  }

  async fetchAllowance(
    contractAddress: string,
    owner: string,
    spender: string
  ): Promise<bigint> {
    try {
      const erc20Contract = new ethers.Contract(
        contractAddress,
        [
          'function allowance(address owner, address spender) view returns (uint256)',
        ],
        this.provider
      );

      const allowance = await erc20Contract.allowance(owner, spender);
      return BigInt(allowance.toString());
    } catch (error) {
      console.error('fetchAllowance::', error);
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
      const chain = ChainUtils.stringToChain(nativeToken.chain);

      if (!chain) {
        throw new Error('Invalid chain');
      }

      const oneInchChainId = evmChainIds[chain as EvmChain];
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

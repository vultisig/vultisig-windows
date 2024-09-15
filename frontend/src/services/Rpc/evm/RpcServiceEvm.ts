import { ethers, TransactionRequest } from 'ethers';
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { CoinMeta } from '../../../model/coin-meta';
import { ITokenService } from '../../Tokens/ITokenService';
import { IRpcService } from '../IRpcService';
import { SpecificEvm } from '../../../model/gas-info';
import { FeeMap, FeeMode } from '../../../model/evm-fee-mode';

export class RpcServiceEvm implements IRpcService, ITokenService {
  private provider: ethers.JsonRpcProvider;
  private rpcUrl: string;

  constructor(rpcUrl: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.rpcUrl = rpcUrl;
  }

  async calculateFee(_coin: Coin): Promise<number> {
    return 0;
  }

  async sendTransaction(encodedTransaction: string): Promise<string> {
    try {
      const txResponse = await this.provider.send('eth_sendRawTransaction', [
        encodedTransaction,
      ]);
      return txResponse.hash;
    } catch (error) {
      console.error('sendTransaction::', error);
      throw error;
    }
  }

  async resolveENS(ensName: string): Promise<string> {
    try {
      const address = await this.provider.resolveName(ensName);
      if (!address)
        throw new Error(`ENS name ${ensName} could not be resolved.`);
      return address;
    } catch (error) {
      console.error('resolveENS::', error);
      throw error;
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
      throw error;
    }
  }

  async fetchTokens(_nativeToken: Coin): Promise<CoinMeta[]> {
    try {
      // Assuming there's some interaction with an external service like OneInch to get token balances
      // The implementation here will depend on how you fetch tokens for a given wallet address.
      // For simplicity, returning an empty array here.
      return [];
    } catch (error) {
      console.error('fetchTokens::', error);
      throw error;
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
      console.error(this.rpcUrl, 'getBalance::', error);
      return '0';
    }
  }

  normalizeFee(value: number): number {
    return value + value / 2; // x1.5 fee
  }

  async getGasInfo(coin: Coin, feeMode?: FeeMode): Promise<SpecificEvm> {
    try {
      const [gasPrice, nonce] = await Promise.all([
        this.provider.send('eth_gasPrice', []),
        this.provider.getTransactionCount(coin.address),
      ]);

      let gasLimit = 23000;
      if (!coin.isNativeToken) {
        gasLimit = 120000;
      }

      const baseFee = await this.getBaseFee();
      const priorityFeeMapValue = await this.fetchMaxPriorityFeesPerGas();
      const priorityFee = priorityFeeMapValue[feeMode || FeeMode.Normal];
      const normalizedBaseFee = this.normalizeFee(Number(baseFee));
      const maxFeePerGasWei = Number(
        BigInt(Math.round(normalizedBaseFee + priorityFee))
      );

      return {
        fee: maxFeePerGasWei * gasLimit,
        gasPrice: Number(gasPrice),
        nonce,
        priorityFee,
        priorityFeeWei: priorityFee,
        gasLimit,
        maxFeePerGasWei: maxFeePerGasWei,
      } as SpecificEvm;
    } catch (error) {
      console.error('getGasInfo::', error);
      throw error;
    }
  }

  async getBaseFee(): Promise<string> {
    try {
      const txResponse = await this.provider.getBlock('latest');

      if (txResponse && txResponse.baseFeePerGas) {
        return txResponse.baseFeePerGas.toString();
      } else {
        return '';
      }
    } catch (error) {
      console.error('sendTransaction::', error);
      throw error;
    }
  }

  async fetchMaxPriorityFeesPerGas(): Promise<FeeMap> {
    try {
      // Fetch fee history (assume getGasHistory is defined)
      const history = await this.getGasHistory();

      // Helper function to map fees to FeeMode
      const priorityFeesMap = (
        low: number,
        normal: number,
        fast: number
      ): FeeMap => ({
        [FeeMode.SafeLow]: low,
        [FeeMode.Normal]: normal,
        [FeeMode.Fast]: fast,
      });

      // If history is empty, fetch a single max priority fee and use it for all modes
      if (history.length === 0) {
        const value = await this.provider.send('eth_maxPriorityFeePerGas', []);
        return priorityFeesMap(value, value, value);
      }

      // Calculate low, normal, and fast fees
      const low = history[0];
      const normal = history[Math.floor(history.length / 2)];
      const fast = history[history.length - 1];

      // Return mapped fees
      return priorityFeesMap(low, normal, fast);
    } catch (error) {
      console.error('fetchMaxPriorityFeesPerGas::', error);
      throw error;
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
      throw error;
    }
  }

  async broadcastTransaction(encodedTransaction: string): Promise<string> {
    try {
      return this.sendTransaction(encodedTransaction);
    } catch (error) {
      console.error('broadcastTransaction::', error);
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
      throw error;
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
      console.error('fetchERC20TokenBalance::', walletAddress, contractAddress, error);

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
      throw error;
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

  async getTokens(_nativeToken: Coin): Promise<CoinMeta[]> {
    try {
      // Fetching tokens logic based on specific API or service used
      return [];
    } catch (error) {
      console.error('getTokens::', error);
      throw error;
    }
  }

  async getGasInfoZk(
    fromAddress: string,
    toAddress: string,
    memo: string = '0xffffffff'
  ): Promise<{
    gasLimit: bigint;
    gasPerPubdataLimit: bigint;
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
    nonce: number;
  }> {
    const memoDataHex = ethers.hexlify(ethers.toUtf8Bytes(memo));
    const data = '0x' + memoDataHex;

    const noncePromise = this.provider.getTransactionCount(fromAddress);
    const feeEstimatePromise = this.zksEstimateFee(
      fromAddress,
      toAddress,
      data
    );

    const [nonce, feeEstimateValue] = await Promise.all([
      noncePromise,
      feeEstimatePromise,
    ]);

    return {
      gasLimit: feeEstimateValue.gasLimit,
      gasPerPubdataLimit: feeEstimateValue.gasPerPubdataLimit,
      maxFeePerGas: feeEstimateValue.maxFeePerGas,
      maxPriorityFeePerGas: feeEstimateValue.maxPriorityFeePerGas,
      nonce: nonce,
    };
  }

  private async zksEstimateFee(
    fromAddress: string,
    toAddress: string,
    data: string
  ): Promise<{
    gasLimit: bigint;
    gasPerPubdataLimit: bigint;
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
  }> {
    const result = await this.provider.send('zks_estimateFee', [
      {
        from: fromAddress,
        to: toAddress,
        data: data,
      },
    ]);

    return {
      gasLimit: BigInt(result.gas_limit),
      gasPerPubdataLimit: BigInt(result.gas_per_pubdata_limit),
      maxFeePerGas: BigInt(result.max_fee_per_gas),
      maxPriorityFeePerGas: BigInt(result.max_priority_fee_per_gas),
    };
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

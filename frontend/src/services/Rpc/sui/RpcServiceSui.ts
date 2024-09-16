/* eslint-disable */
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { CoinMeta } from '../../../model/coin-meta';
import { SpecificTransactionInfo } from '../../../model/specific-transaction-info';
import { IRpcService } from '../IRpcService';

export class RpcServiceSui implements IRpcService {
  calculateFee(coin: Coin): Promise<number> {
    throw new Error('Method not implemented.');
  }
  sendTransaction(encodedTransaction: string): Promise<string> {
    throw new Error('Method not implemented.');
  }
  getBalance(coin: Coin): Promise<string> {
    throw new Error('Method not implemented.');
  }
  broadcastTransaction(hex: string): Promise<string> {
    throw new Error('Method not implemented.');
  }
  resolveENS?(ensName: string): Promise<string> {
    throw new Error('Method not implemented.');
  }
  getSpecificTransactionInfo(coin: Coin): Promise<SpecificTransactionInfo> {
    throw new Error('Method not implemented.');
  }
  estimateGas?(
    senderAddress: string,
    recipientAddress: string,
    value: bigint,
    memo?: string
  ): Promise<bigint> {
    throw new Error('Method not implemented.');
  }
  fetchTokenBalance?(
    contractAddress: string,
    walletAddress: string
  ): Promise<bigint> {
    throw new Error('Method not implemented.');
  }
  fetchAllowance?(
    contractAddress: string,
    owner: string,
    spender: string
  ): Promise<bigint> {
    throw new Error('Method not implemented.');
  }
  getTokenInfo?(
    contractAddress: string
  ): Promise<{ name: string; symbol: string; decimals: number }> {
    throw new Error('Method not implemented.');
  }
  fetchTokens?(nativeToken: Coin): Promise<CoinMeta[]> {
    throw new Error('Method not implemented.');
  }
}

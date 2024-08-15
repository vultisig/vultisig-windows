/* eslint-disable */
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { CoinMeta } from '../../../model/coin-meta';
import { ITokenService } from '../../Tokens/ITokenService';
import { IRpcService } from '../IRpcService';

export class RpcServiceEvm implements IRpcService, ITokenService {
  private rpcUrl: string;

  constructor(rpcUrl: string) {
    this.rpcUrl = rpcUrl;
  }

  getTokens(nativeToken: Coin): Promise<CoinMeta[]> {
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
  getGasInfo?(
    fromAddress: string
  ): Promise<{ gasPrice: BigInt; priorityFee: BigInt; nonce: number }> {
    throw new Error('Method not implemented.');
  }
  estimateGas?(
    senderAddress: string,
    recipientAddress: string,
    value: BigInt,
    memo?: string
  ): Promise<BigInt> {
    throw new Error('Method not implemented.');
  }
  fetchTokenBalance?(
    contractAddress: string,
    walletAddress: string
  ): Promise<BigInt> {
    throw new Error('Method not implemented.');
  }
  fetchAllowance?(
    contractAddress: string,
    owner: string,
    spender: string
  ): Promise<BigInt> {
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
  fetchRecentBlockhash?(): Promise<string> {
    throw new Error('Method not implemented and does not apply to this chain.');
  }
  fetchTokenAssociatedAccountByOwner?(
    walletAddress: string,
    mintAddress: string
  ): Promise<string> {
    throw new Error('Method not implemented and does not apply to this chain.');
  }
  fetchTokenAccountsByOwner?(walletAddress: string): Promise<[]> {
    throw new Error('Method not implemented and does not apply to this chain.');
  }
  fetchHighPriorityFee?(account: string): Promise<number> {
    throw new Error('Method not implemented and does not apply to this chain.');
  }
}

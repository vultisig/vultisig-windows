import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { CoinMeta } from '../../model/coin-meta';

export interface IRpcService {
  // Common methods
  sendTransaction(encodedTransaction: string): Promise<string>;
  getBalance(coin: Coin): Promise<string>;
  broadcastTransaction(hex: string): Promise<string>;

  // Ethereum-specific methods
  getGasInfo?(
    fromAddress: string
  ): Promise<{ gasPrice: bigint; priorityFee: bigint; nonce: number }>;
  estimateGas?(
    senderAddress: string,
    recipientAddress: string,
    value: bigint,
    memo?: string
  ): Promise<bigint>;
  fetchTokenBalance?(
    contractAddress: string,
    walletAddress: string
  ): Promise<bigint>;
  fetchAllowance?(
    contractAddress: string,
    owner: string,
    spender: string
  ): Promise<bigint>;
  getTokenInfo?(
    contractAddress: string
  ): Promise<{ name: string; symbol: string; decimals: number }>;
  fetchTokens?(nativeToken: Coin): Promise<CoinMeta[]>;

  // Solana-specific methods
  fetchRecentBlockhash?(): Promise<string>;
  fetchTokenAssociatedAccountByOwner?(
    walletAddress: string,
    mintAddress: string
  ): Promise<string>;
  fetchTokenAccountsByOwner?(walletAddress: string): Promise<[]>;
  fetchHighPriorityFee?(account: string): Promise<number>;
}

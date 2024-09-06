/* eslint-disable */
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { CoinMeta } from '../../../model/coin-meta';
import { SpecificUtxo } from '../../../model/gas-info';
import { Endpoint } from '../../Endpoint';
import { IRpcService } from '../IRpcService';

export class RpcServiceUtxo implements IRpcService {
  async calculateFee(coin: Coin): Promise<number> {
    const url = Endpoint.blockchairStats(coin.chain.toLowerCase());
    const request = await fetch(url);
    const response = await request.json();
    const fee = response.data.suggested_transaction_fee_per_byte_sat;
    return fee;
  }

  async getBalance(coin: Coin): Promise<string> {
    let coinName = coin.chain.toLowerCase();
    let url = Endpoint.blockchairDashboard(coin.address, coinName);
    let request = await fetch(url);
    let response = await request.json();
    let balance = response.data[coin.address].address.balance;
    return balance;
  }

  async getGasInfo(coin: Coin): Promise<SpecificUtxo> {
    const byteFeePrice = await this.calculateFee(coin);
    const gasInfo: SpecificUtxo = {
      gasPrice: byteFeePrice / 10 ** coin.decimals, // To display in the UI
      fee: 0,
      byteFee: byteFeePrice,
      sendMaxAmount: false, // By default, we don't send as the max amount
    };

    return gasInfo;
  }

  sendTransaction(encodedTransaction: string): Promise<string> {
    throw new Error('Method not implemented.');
  }

  broadcastTransaction(hex: string): Promise<string> {
    throw new Error('Method not implemented.');
  }

  // No need to implement the following methods for UTXO
  resolveENS?(ensName: string): Promise<string> {
    throw new Error('Method not implemented, UTXO does not have ENS.');
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
  fetchRecentBlockhash?(): Promise<string> {
    throw new Error('Method not implemented.');
  }
  fetchTokenAssociatedAccountByOwner?(
    walletAddress: string,
    mintAddress: string
  ): Promise<string> {
    throw new Error('Method not implemented.');
  }
  fetchTokenAccountsByOwner?(walletAddress: string): Promise<[]> {
    throw new Error('Method not implemented.');
  }
  fetchHighPriorityFee?(account: string): Promise<number> {
    throw new Error('Method not implemented.');
  }
}

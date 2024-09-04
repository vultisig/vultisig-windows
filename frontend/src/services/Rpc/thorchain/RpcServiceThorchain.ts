/* eslint-disable */
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { Chain } from '../../../model/chain';
import { CoinMeta } from '../../../model/coin-meta';
import { SpecificThorchain } from '../../../model/gas-info';
import { Endpoint } from '../../Endpoint';
import { IRpcService } from '../IRpcService';

export class RpcServiceThorchain implements IRpcService {
  async calculateFee(_coin?: Coin): Promise<number> {
    let urlString = Endpoint.fetchThorchainNetworkInfoNineRealms;
    const response = await fetch(urlString);
    const data = await response.json();

    const fee = Number(data.native_tx_fee_rune);

    return fee;
  }

  async sendTransaction(encodedTransaction: string): Promise<string> {
    return await this.broadcastTransaction(encodedTransaction);
  }

  async getBalance(coin: Coin): Promise<string> {
    let url = Endpoint.fetchAccountBalanceThorchainNineRealms(coin.address);
    const response = await fetch(url, {
      headers: {
        'X-Client-ID': 'vultisig',
      },
    });

    const data = await response.json();

    return (
      data.balances.find(
        (b: any) => b.denom.toLowerCase() === coin.ticker.toLowerCase()
      ).amount ?? 0
    );
  }

  async broadcastTransaction(hex: string): Promise<string> {
    const url = Endpoint.broadcastTransactionThorchainNineRealms;

    // fetch to post the transaction
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: hex,
    });

    const data = await response.json();
    return data.txResponse?.txhash;
  }

  async resolveENS?(ensName: string): Promise<string> {
    let url = Endpoint.resolveTNS(ensName);
    const response = await fetch(url);
    const data = await response.json();
    const entry = data.entries.find(
      (e: any) =>
        e.chain.toLowerCase() === Chain.THORChain.toString().toLowerCase()
    );

    if (!entry) {
      throw new Error('TNS entry not found');
    }
    return entry.address;
  }

  async getGasInfo(coin: Coin): Promise<SpecificThorchain> {
    const account = await this.fetchAccountNumber(coin.address);

    const fee = await this.calculateFee(coin);

    const specificThorchain: SpecificThorchain = {
      fee, // sometimes the fee is calculated like EVMs, so we need to add it here
      gasPrice: fee, //The gas price is the price per byte of the transaction
      accountNumber: Number(account?.account_number),
      sequence: Number(account?.sequence ?? 0),
      isDeposit: false,
    } as SpecificThorchain;

    return specificThorchain;
  }

  async fetchAccountNumber(address: string) {
    const url = Endpoint.fetchAccountNumberThorchainNineRealms(address);
    const response = await fetch(url, {
      headers: {
        'X-Client-ID': 'vultisig',
      },
    });

    const data = await response.json();
    return data.result.value;
  }

  static async getTHORChainChainID(): Promise<string> {
    const chainID = localStorage.getItem('THORChainChainID');
    if (chainID) {
      return chainID;
    }

    let urlString = Endpoint.fetchThorchainNetworkInfoNineRealms;
    const response = await fetch(urlString);
    const data = await response.json();
    const network = data.result.node_info.network;

    localStorage.setItem('THORChainChainID', network);

    return network;
  }

  estimateGas?(
    _senderAddress: string,
    _recipientAddress: string,
    _value: bigint,
    _memo?: string
  ): Promise<bigint> {
    throw new Error('Method not implemented.');
  }
  fetchTokenBalance?(
    _contractAddress: string,
    _walletAddress: string
  ): Promise<bigint> {
    throw new Error('Method not implemented.');
  }
  fetchAllowance?(
    _contractAddress: string,
    _owner: string,
    _spender: string
  ): Promise<bigint> {
    throw new Error('Method not implemented.');
  }
  getTokenInfo?(
    _contractAddress: string
  ): Promise<{ name: string; symbol: string; decimals: number }> {
    throw new Error('Method not implemented.');
  }
  fetchTokens?(_nativeToken: Coin): Promise<CoinMeta[]> {
    throw new Error('Method not implemented.');
  }
  fetchRecentBlockhash?(): Promise<string> {
    throw new Error('Method not implemented.');
  }
  fetchTokenAssociatedAccountByOwner?(
    _walletAddress: string,
    _mintAddress: string
  ): Promise<string> {
    throw new Error('Method not implemented.');
  }
  fetchTokenAccountsByOwner?(_walletAddress: string): Promise<[]> {
    throw new Error('Method not implemented.');
  }
  fetchHighPriorityFee?(_account: string): Promise<number> {
    throw new Error('Method not implemented.');
  }
}

import { getChainFeeCoin } from '../../../chain/tx/fee/utils/getChainFeeCoin';
import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { Chain } from '../../../model/chain';
import { SpecificThorchain } from '../../../model/specific-transaction-info';
import { Endpoint } from '../../Endpoint';
import { IRpcService } from '../IRpcService';

export class RpcServiceMaya implements IRpcService {
  async calculateFee(_coin?: Coin): Promise<number> {
    return 2000000000;
  }

  async sendTransaction(encodedTransaction: string): Promise<string> {
    return await this.broadcastTransaction(encodedTransaction);
  }

  async getBalance(coin: Coin): Promise<string> {
    const url = Endpoint.fetchAccountBalanceMayachain(coin.address);

    const response = await fetch(url);

    const data = await response.json();

    return (
      data?.balances?.find(
        (b: any) => b.denom.toLowerCase() === coin.ticker.toLowerCase()
      )?.amount ?? 0
    );
  }

  async broadcastTransaction(hex: string): Promise<string> {
    const url = Endpoint.broadcastTransactionMayachain;

    // fetch to post the transaction
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: hex,
    });

    const data = await response.json();
    return data.tx_response?.txhash;
  }

  async resolveENS?(ensName: string): Promise<string> {
    const url = Endpoint.resolveTNS(ensName);
    const response = await fetch(url);
    const data = await response.json();
    const entry = data.entries.find(
      (e: any) =>
        e.chain.toLowerCase() === Chain.MayaChain.toString().toLowerCase()
    );

    if (!entry) {
      throw new Error('TNS entry not found');
    }
    return entry.address;
  }

  async getSpecificTransactionInfo(coin: Coin): Promise<SpecificThorchain> {
    const account = await this.fetchAccountNumber(coin.address);

    const fee = await this.calculateFee(coin);

    const specificThorchain: SpecificThorchain = {
      fee, // sometimes the fee is calculated like EVMs, so we need to add it here
      gasPrice: fromChainAmount(fee, getChainFeeCoin(Chain.MayaChain).decimals),
      accountNumber: Number(account?.account_number),
      sequence: Number(account?.sequence ?? 0),
      isDeposit: false,
    } as SpecificThorchain;

    return specificThorchain;
  }

  async fetchAccountNumber(address: string) {
    const url = Endpoint.fetchAccountNumberMayachain(address);
    const response = await fetch(url);

    const data = await response.json();
    return data.result.value;
  }
}

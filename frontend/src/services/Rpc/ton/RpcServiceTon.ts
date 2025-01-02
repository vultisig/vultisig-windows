import { Fetch, Post } from '../../../../wailsjs/go/utils/GoHttp';
import { KeysignChainSpecific } from '../../../chain/keysign/KeysignChainSpecific';
import { TonSpecific } from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { Endpoint } from '../../Endpoint';
import { GetChainSpecificInput, IRpcService } from '../IRpcService';
import { RpcService } from '../RpcService';

export class RpcServiceTon extends RpcService implements IRpcService {
  async sendTransaction(encodedTransaction: string): Promise<string> {
    return await this.broadcastTransaction(encodedTransaction);
  }

  async broadcastTransaction(obj: string): Promise<string> {
    const response = await Post(Endpoint.broadcastTonTransaction(), {
      boc: obj,
    });
    return response.result.hash;
  }

  async getBalance(coin: Coin): Promise<string> {
    const response: TonAddressInformation = await this.getAddressInformation(
      coin.address
    );
    return response.balance;
  }

  async getChainSpecific({ coin }: GetChainSpecificInput) {
    const extendedInfo = await this.getExtendedAddressInformation(coin.address);
    const sequenceNumber = BigInt(
      extendedInfo?.result?.account_state?.seqno || 0
    );

    const result: KeysignChainSpecific = {
      case: 'tonSpecific',
      value: new TonSpecific({
        sequenceNumber,
        expireAt: BigInt(Math.floor(Date.now() / 1000) + 600),
        bounceable: false,
      }),
    };

    return result;
  }

  private async getAddressInformation(
    address: string
  ): Promise<TonAddressInformation> {
    return await Fetch(Endpoint.fetchTonBalance(address));
  }

  private async getExtendedAddressInformation(
    address: string
  ): Promise<ApiResponse> {
    return await Fetch(Endpoint.fetchExtendedAddressInformation(address));
  }
}

export interface TonAddressInformation {
  balance: string;
  code: string;
  data: string;
  frozen_hash: string;
  last_transaction_hash: string;
  last_transaction_lt: string;
  status: string;
}

interface ApiResponse {
  ok: boolean;
  result: Result;
}

interface Result {
  '@type': 'fullAccountState';
  address: Address;
  balance: string;
  last_transaction_id: LastTransactionId;
  block_id: BlockId;
  sync_utime: number;
  account_state: AccountState;
  revision: number;
  '@extra': string;
}

interface Address {
  '@type': 'accountAddress';
  account_address: string;
}

interface LastTransactionId {
  '@type': 'internal.transactionId';
  lt: string;
  hash: string;
}

interface BlockId {
  '@type': 'ton.blockIdExt';
  workchain: number;
  shard: string;
  seqno: number;
  root_hash: string;
  file_hash: string;
}

interface AccountState {
  '@type': 'wallet.v4.accountState';
  wallet_id: string;
  seqno: number;
}

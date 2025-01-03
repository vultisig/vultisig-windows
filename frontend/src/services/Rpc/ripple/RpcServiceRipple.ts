import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { Endpoint } from '../../Endpoint';
import { IRpcService } from '../IRpcService';
import { RpcService } from '../RpcService';

export class RpcServiceRipple extends RpcService implements IRpcService {
  sendTransaction(encodedTransaction: string): Promise<string> {
    throw new Error(
      `Method not implemented, encodedTransaction: ${encodedTransaction}`
    );
  }

  async getBalance(coin: Coin): Promise<string> {
    const accountInfo = await this.fetchAccountsInfo(coin.address);
    const balance = accountInfo?.account_data?.Balance;
    return balance ?? '0';
  }

  async broadcastTransaction(hex: string): Promise<string> {
    try {
      const data = await super.callRpc(Endpoint.rippleServiceRpc, 'submit', [
        {
          tx_blob: hex,
        },
      ]);

      if (data?.engine_result && data?.engine_result !== 'tesSUCCESS') {
        if (data?.engine_result_message) {
          if (
            data?.engine_result_message.toLowerCase() ===
              'this sequence number has already passed.' &&
            data?.tx_json?.hash
          ) {
            return data?.tx_json.hash;
          }
          return data?.engine_result_message;
        }
      }

      if (data?.tx_json?.hash) {
        return data?.tx_json.hash;
      }
    } catch (e) {
      console.error('Error to broadcast:', e);
    }

    return '';
  }

  async fetchAccountsInfo(walletAddress: string): Promise<any> {
    try {
      return await super.callRpc(Endpoint.rippleServiceRpc, 'account_info', [
        {
          account: walletAddress,
          ledger_index: 'current',
          queue: true,
        },
      ]);
    } catch {
      console.error('Error in fetchTokenAccountsByOwner:');
    }
  }

  resolveENS?(ensName: string): Promise<string> {
    throw new Error(`Method not implemented, ensName: ${ensName}`);
  }
}

import { KeysignChainSpecific } from '../../../chain/keysign/KeysignChainSpecific';
import { polkadotConfig } from '../../../chain/polkadot/config';
import { PolkadotSpecific } from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { Endpoint } from '../../Endpoint';
import { GetChainSpecificInput, IRpcService } from '../IRpcService';
import { RpcService } from '../RpcService';

export class RpcServicePolkadot extends RpcService implements IRpcService {
  async calculateFee(_coin: Coin): Promise<number> {
    return polkadotConfig.fee;
  }

  async sendTransaction(encodedTransaction: string): Promise<string> {
    return await this.broadcastTransaction(encodedTransaction);
  }

  async getBalance(coin: Coin): Promise<string> {
    const balance = await this.fetchBalance(coin.address);
    return balance.toString();
  }

  async broadcastTransaction(hex: string): Promise<string> {
    const hexWithPrefix = hex.startsWith('0x') ? hex : '0x(hex)';
    const result: string = await this.callRPC('author_submitExtrinsic', [
      hexWithPrefix,
    ]);
    return result;
  }

  async getChainSpecific({ coin }: GetChainSpecificInput) {
    const recentBlockHash = await this.fetchBlockHash();
    const nonce = await this.fetchNonce(coin.address);
    const currentBlockNumber = Number(await this.fetchBlockHeader());
    const genesisHash = await this.fetchGenesisBlockHash();

    const { specVersion, transactionVersion } =
      await this.fetchRuntimeVersion();

    const result: KeysignChainSpecific = {
      case: 'polkadotSpecific',
      value: new PolkadotSpecific({
        recentBlockHash,
        nonce: BigInt(nonce),
        currentBlockNumber: currentBlockNumber.toString(),
        specVersion,
        transactionVersion,
        genesisHash,
      }),
    };

    return result;
  }

  private async fetchBalance(address: string): Promise<bigint> {
    const body = { key: address };
    const maxRetries = 3;
    const retryDelay = 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const requestBody = JSON.stringify(body);

        const response = await fetch(Endpoint.polkadotServiceBalance, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: requestBody,
        });

        const result = await response.json();

        if (result.data?.account?.balance) {
          const balance = BigInt(
            Number(result.data.account.balance) * 10 ** 10
          );
          return balance;
        }
      } catch (error) {
        console.error(
          `PolkadotService > fetchBalance > ${error}, Attempt: ${attempt} of ${maxRetries}`
        );
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        } else {
          return BigInt(0);
        }
      }
    }

    return BigInt(0);
  }

  async callRPC(method: string, params: any[]): Promise<any> {
    return await super.callRpc(Endpoint.polkadotServiceRpc, method, params);
  }

  private async fetchNonce(address: string): Promise<number> {
    const result = await this.callRPC('system_accountNextIndex', [address]);
    return Number(result);
  }

  private async fetchBlockHash(): Promise<string> {
    const result: string = await this.callRPC('chain_getBlockHash', []);
    return result;
  }

  private async fetchGenesisBlockHash(): Promise<string> {
    const result = await this.callRPC('chain_getBlockHash', [0]);
    return result;
  }

  private async fetchRuntimeVersion(): Promise<any> {
    const result: any = await this.callRPC('state_getRuntimeVersion', []);
    return {
      specVersion: result.specVersion,
      transactionVersion: result.transactionVersion,
    };
  }

  private async fetchBlockHeader(): Promise<number> {
    const result: any = await this.callRPC('chain_getHeader', []);
    return Number(result.number);
  }
}

import { KeysignPayload } from '../gen/vultisig/keysign/v1/keysign_message_pb';
import { useWalletCore } from '../main';
import { ChainUtils } from '../model/chain';
import { BlockchainServiceFactory } from '../services/Blockchain/BlockchainServiceFactory';

export class KeysignPayloadUtils {
  static async getPreKeysignImages(
    keysignPayload: KeysignPayload
  ): Promise<string[]> {
    const walletCore = useWalletCore();
    if (keysignPayload.coin === undefined) {
      return [];
    }
    if (walletCore === undefined) {
      return [];
    }
    const c = ChainUtils.stringToChain(keysignPayload.coin.chain);
    if (c === undefined) {
      return [];
    }
    const service = BlockchainServiceFactory.createService(c, walletCore!);
    if (service === undefined) {
      return [];
    }
    return await service.getPreSignedImageHash(keysignPayload);
  }
}

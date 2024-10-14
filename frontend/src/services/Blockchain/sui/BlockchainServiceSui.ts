import { TW } from '@trustwallet/wallet-core';

import { storage, tss } from '../../../../wailsjs/go/models';
import { Keysign } from '../../../../wailsjs/go/tss/TssService';
import {
  SuiCoin,
  SuiSpecific,
} from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { Chain, ChainUtils } from '../../../model/chain';
import { SpecificSui } from '../../../model/specific-transaction-info';
import {
  ISendTransaction,
  ISwapTransaction,
  ITransaction,
  TransactionType,
} from '../../../model/transaction';
import { CoinServiceFactory } from '../../Coin/CoinServiceFactory';
import { RpcServiceFactory } from '../../Rpc/RpcServiceFactory';
import { BlockchainService } from '../BlockchainService';
import { IBlockchainService } from '../IBlockchainService';

export class BlockchainServiceSui
  extends BlockchainService
  implements IBlockchainService
{
  async signAndBroadcastTransaction(
    vault: storage.Vault,
    messages: string[],
    sessionID: string,
    hexEncryptionKey: string,
    serverURL: string,
    keysignPayload: KeysignPayload
  ): Promise<string> {
    try {
      const coinService = CoinServiceFactory.createCoinService(
        this.chain,
        this.walletCore
      );

      const rpcService = RpcServiceFactory.createRpcService(this.chain);

      const tssType = ChainUtils.getTssKeysignType(this.chain);

      const keysignGoLang = await Keysign(
        vault,
        messages,
        vault.local_party_id,
        this.walletCore.CoinTypeExt.derivationPath(coinService.getCoinType()),
        sessionID,
        hexEncryptionKey,
        serverURL,
        tssType.toString().toLowerCase()
      );

      const signatures: { [key: string]: tss.KeysignResponse } = {};
      messages.forEach((msg, idx) => {
        signatures[msg] = keysignGoLang[idx];
      });

      const signedTx = await this.getSignedTransaction(
        vault.public_key_eddsa,
        vault.hex_chain_code,
        keysignPayload,
        signatures
      );

      if (!signedTx) {
        console.error("Couldn't sign transaction");
        return "Couldn't sign transaction";
      }

      let txBroadcastedHash = await rpcService.broadcastTransaction(
        signedTx.rawTransaction
      );

      console.log('txBroadcastedHash:', txBroadcastedHash);
      console.log('txHash:', signedTx.transactionHash);

      if (txBroadcastedHash !== signedTx.transactionHash) {
        if (txBroadcastedHash === 'Transaction already broadcasted.') {
          txBroadcastedHash = signedTx.transactionHash;
        } else {
          return 'Transaction hash mismatch';
        }
      }
      return txBroadcastedHash;
    } catch (e: any) {
      console.error(e);
      return e.message;
    }
  }

  createKeysignPayload(
    obj: ITransaction | ISendTransaction | ISwapTransaction,
    localPartyId: string,
    publicKeyEcdsa: string
  ): KeysignPayload {
    const payload: KeysignPayload = super.createKeysignPayload(
      obj,
      localPartyId,
      publicKeyEcdsa
    );
    const specific_pb = new SuiSpecific();
    const transactionInfoSpecific: SpecificSui =
      obj.specificTransactionInfo as SpecificSui;

    switch (obj.transactionType) {
      case TransactionType.SEND:
        specific_pb.coins = transactionInfoSpecific.coins || [];
        specific_pb.referenceGasPrice =
          transactionInfoSpecific.referenceGasPrice.toString();

        payload.blockchainSpecific = {
          case: 'suicheSpecific',
          value: specific_pb,
        };
        break;

      case TransactionType.SWAP:
        payload.blockchainSpecific = {
          case: 'suicheSpecific',
          value: specific_pb,
        };
        break;

      default:
        throw new Error(`Unsupported transaction type: ${obj.transactionType}`);
    }

    return payload;
  }

  async getPreSignedInputData(
    keysignPayload: KeysignPayload
  ): Promise<Uint8Array> {
    if (keysignPayload.coin?.chain !== Chain.Sui) {
      console.error('Coin is not Sui');
      console.error('keysignPayload.coin?.chain:', keysignPayload.coin?.chain);
    }

    const suiSpecific = keysignPayload.blockchainSpecific.value as SuiSpecific;
    if (!suiSpecific) {
      console.error(
        'getPreSignedInputData fail to get SUI transaction information from RPC'
      );
    }

    const { coins, referenceGasPrice } = suiSpecific;

    const inputData = TW.Sui.Proto.SigningInput.create({
      referenceGasPrice: referenceGasPrice,
      signer: keysignPayload.coin?.address,
      gasBudget: 3000000,

      paySui: TW.Sui.Proto.PaySui.create({
        inputCoins: coins.map((coin: SuiCoin) => {
          const obj = TW.Sui.Proto.ObjectRef.create({
            objectDigest: coin.digest,
            objectId: coin.coinObjectId,
            version: coin.version,
          });
          return obj;
        }),
        recipients: [keysignPayload.toAddress],
        amounts: [BigInt(keysignPayload.toAmount)],
      }),
    });

    return TW.Sui.Proto.SigningInput.encode(inputData).finish();
  }

  async getPreSignedImageHash(
    keysignPayload: KeysignPayload
  ): Promise<string[]> {
    try {
      const walletCore = this.walletCore;
      const coinType = walletCore.CoinType.sui;
      const inputData = await this.getPreSignedInputData(keysignPayload);
      const hashes = walletCore.TransactionCompiler.preImageHashes(
        coinType,
        inputData
      );
      const preSigningOutput =
        TW.TxCompiler.Proto.PreSigningOutput.decode(hashes);
      if (preSigningOutput.errorMessage !== '') {
        console.error('preSigningOutput error:', preSigningOutput.errorMessage);
        throw new Error(preSigningOutput.errorMessage);
      }

      const blakeHash = this.walletCore.Hash.blake2b(preSigningOutput.data, 32);
      const blakeHashes = [
        walletCore.HexCoding.encode(blakeHash).stripHexPrefix(),
      ];

      console.log('blakeHashes:', blakeHashes);

      return blakeHashes;
    } catch (error) {
      console.error('getPreSignedImageHash::', error);
      return [];
    }
  }
}

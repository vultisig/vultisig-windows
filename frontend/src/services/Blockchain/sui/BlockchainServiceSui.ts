import { TW } from '@trustwallet/wallet-core';
import Long from 'long';

import { storage, tss } from '../../../../wailsjs/go/models';
import { Keysign } from '../../../../wailsjs/go/tss/TssService';
import { getCoinType } from '../../../chain/walletCore/getCoinType';
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
import { RpcServiceFactory } from '../../Rpc/RpcServiceFactory';
import { BlockchainService } from '../BlockchainService';
import { IBlockchainService } from '../IBlockchainService';
import SignatureProvider from '../signature-provider';
import { SignedTransactionResult } from '../signed-transaction-result';

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
      const rpcService = RpcServiceFactory.createRpcService(this.chain);

      const tssType = ChainUtils.getTssKeysignType(this.chain);

      const coinType = getCoinType({
        walletCore: this.walletCore,
        chain: this.chain,
      });

      const keysignGoLang = await Keysign(
        vault,
        messages,
        vault.local_party_id,
        this.walletCore.CoinTypeExt.derivationPath(coinType),
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

      const txBroadcastedHash = await rpcService.broadcastTransaction(
        JSON.stringify({
          unsignedTransaction: signedTx.rawTransaction,
          signature: signedTx.signature,
        })
      );

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
      referenceGasPrice: Long.fromString(referenceGasPrice),
      signer: keysignPayload.coin?.address,
      gasBudget: Long.fromString('3000000'),

      paySui: TW.Sui.Proto.PaySui.create({
        inputCoins: coins.map((coin: SuiCoin) => {
          const obj = TW.Sui.Proto.ObjectRef.create({
            objectDigest: coin.digest,
            objectId: coin.coinObjectId,
            version: Long.fromString(coin.version),
          });
          return obj;
        }),
        recipients: [keysignPayload.toAddress],
        amounts: [Long.fromString(keysignPayload.toAmount)],
      }),
    });

    const input = TW.Sui.Proto.SigningInput.encode(inputData).finish();
    return input;
  }

  public async getSignedTransaction(
    vaultHexPublicKey: string,
    vaultHexChainCode: string,
    data: KeysignPayload | Uint8Array,
    signatures: { [key: string]: tss.KeysignResponse }
  ): Promise<SignedTransactionResult> {
    let inputData: Uint8Array;
    if (data instanceof Uint8Array) {
      inputData = data;
    } else {
      inputData = await this.getPreSignedInputData(data);
    }

    const publicKey = await this.addressService.getPublicKey(
      '',
      vaultHexPublicKey,
      vaultHexChainCode
    );
    const publicKeyData = publicKey.data();

    const preHashes = this.walletCore.TransactionCompiler.preImageHashes(
      this.coinType,
      inputData
    );

    const preSigningOutput =
      TW.TxCompiler.Proto.PreSigningOutput.decode(preHashes);
    if (preSigningOutput.errorMessage !== '') {
      console.error('preSigningOutput error:', preSigningOutput.errorMessage);
      throw new Error(preSigningOutput.errorMessage);
    }

    const allSignatures = this.walletCore.DataVector.create();
    const publicKeys = this.walletCore.DataVector.create();
    const signatureProvider = new SignatureProvider(
      this.walletCore,
      signatures
    );

    const blakeHash = this.walletCore.Hash.blake2b(preSigningOutput.data, 32);

    const signature = signatureProvider.getSignature(blakeHash);

    if (!publicKey.verify(signature, blakeHash)) {
      console.error('Failed to verify signature');
      throw new Error('Failed to verify signature');
    }

    allSignatures.add(signature);
    publicKeys.add(publicKeyData);

    const compiled = this.walletCore.TransactionCompiler.compileWithSignatures(
      this.coinType,
      inputData,
      allSignatures,
      publicKeys
    );

    const output = TW.Sui.Proto.SigningOutput.decode(compiled);
    if (output.errorMessage !== '') {
      console.error('output error:', output.errorMessage);
      throw new Error(output.errorMessage);
    }

    const result = new SignedTransactionResult(
      output.unsignedTx,
      '',
      output.signature
    );

    return result;
  }
}

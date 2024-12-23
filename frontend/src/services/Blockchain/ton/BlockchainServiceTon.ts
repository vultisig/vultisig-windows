/* eslint-disable */
import { TW } from '@trustwallet/wallet-core';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { IBlockchainService } from '../IBlockchainService';
import { TonSpecific } from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import {
  ISendTransaction,
  ISwapTransaction,
  ITransaction,
  TransactionType,
} from '../../../model/transaction';
import { BlockchainService } from '../BlockchainService';
import { SpecificTon } from '../../../model/specific-transaction-info';
import { SignedTransactionResult } from '../signed-transaction-result';
import { storage, tss } from '../../../../wailsjs/go/models';
import { AddressServiceFactory } from '../../Address/AddressServiceFactory';
import SignatureProvider from '../signature-provider';
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core';
import { Keysign } from '../../../../wailsjs/go/tss/TssService';
import { ChainUtils } from '../../../model/chain';
import { CoinServiceFactory } from '../../Coin/CoinServiceFactory';
import { RpcServiceFactory } from '../../Rpc/RpcServiceFactory';
import Long from 'long';
import { getCoinType } from '../../../chain/walletCore/getCoinType';

export class BlockchainServiceTon
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

      let txBroadcastedHash = await rpcService.broadcastTransaction(
        signedTx.rawTransaction
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
    const specific_pb = new TonSpecific();
    const transactionInfoSpecific: SpecificTon =
      obj.specificTransactionInfo as SpecificTon;

    switch (obj.transactionType) {
      case TransactionType.SEND:
        specific_pb.bounceable = transactionInfoSpecific.bounceable;
        specific_pb.expireAt = BigInt(transactionInfoSpecific.expireAt);
        specific_pb.sequenceNumber = BigInt(
          transactionInfoSpecific.sequenceNumber
        );

        payload.blockchainSpecific = {
          case: 'tonSpecific',
          value: specific_pb,
        };
        break;

      case TransactionType.SWAP:
        payload.blockchainSpecific = {
          case: 'tonSpecific',
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
    const blockchainSpecific = keysignPayload.blockchainSpecific as
      | { case: 'tonSpecific'; value: TonSpecific }
      | undefined;

    if (!blockchainSpecific || blockchainSpecific.case !== 'tonSpecific') {
      throw new Error('Invalid blockchain specific');
    }

    const specific = blockchainSpecific.value;

    if (!keysignPayload.coin) {
      throw new Error('Invalid coin');
    }

    const {
      bounceable, // used for bounceable messages
      expireAt,
      sequenceNumber,
    } = specific;

    const pubKeyData = Buffer.from(keysignPayload.coin.hexPublicKey, 'hex');
    if (!pubKeyData) {
      throw new Error('invalid hex public key');
    }

    const tokenTransferMessage = TW.TheOpenNetwork.Proto.Transfer.create({
      dest: keysignPayload.toAddress,
      amount: new Long(Number(keysignPayload.toAmount)),
      bounceable:
        (keysignPayload.memo &&
          ['d', 'w'].includes(keysignPayload.memo.trim())) ||
        false,
      comment: keysignPayload.memo,
      mode:
        TW.TheOpenNetwork.Proto.SendMode.PAY_FEES_SEPARATELY |
        TW.TheOpenNetwork.Proto.SendMode.IGNORE_ACTION_PHASE_ERRORS,
    });

    const inputObject = {
      walletVersion: TW.TheOpenNetwork.Proto.WalletVersion.WALLET_V4_R2,
      expireAt: Number(expireAt.toString()),
      sequenceNumber: Number(sequenceNumber.toString()),
      messages: [tokenTransferMessage],
      publicKey: new Uint8Array(pubKeyData),
    };

    // Native token transfer
    const input = TW.TheOpenNetwork.Proto.SigningInput.create(inputObject);

    // Encode the input
    const encodedInput =
      TW.TheOpenNetwork.Proto.SigningInput.encode(input).finish();

    return encodedInput;
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

    const addressService = AddressServiceFactory.createAddressService(
      this.chain,
      this.walletCore
    );

    const publicKey: PublicKey = await addressService.getPublicKey(
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
      throw new Error(preSigningOutput.errorMessage);
    }

    const allSignatures = this.walletCore.DataVector.create();
    const publicKeys = this.walletCore.DataVector.create();
    const signatureProvider = new SignatureProvider(
      this.walletCore,
      signatures
    );
    const signature = signatureProvider.getSignature(preSigningOutput.data);
    if (!publicKey.verify(signature, preSigningOutput.data)) {
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

    const output = TW.TheOpenNetwork.Proto.SigningOutput.decode(compiled);
    if (output.errorMessage !== '') {
      throw new Error(output.errorMessage);
    }

    const result = new SignedTransactionResult(
      output.encoded,
      Buffer.from(output.hash).toString('base64')
    );

    return result;
  }
}

/* eslint-disable */
import { TW } from '@trustwallet/wallet-core';
import { tss } from '../../../../wailsjs/go/models';
import { THORChainSpecific } from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { Chain } from '../../../model/chain';
import { IBlockchainService } from '../IBlockchainService';
import { SignedTransactionResult } from '../signed-transaction-result';
import SigningMode = TW.Cosmos.Proto.SigningMode;
import BroadcastMode = TW.Cosmos.Proto.BroadcastMode;
import TxCompiler = TW.TxCompiler;
import SignatureProvider from '../signature-provider';
import { createHash } from 'crypto';
import { AddressServiceFactory } from '../../Address/AddressServiceFactory';
import { BlockchainService } from '../BlockchainService';
import { SpecificThorchain } from '../../../model/specific-transaction-info';
import {
  ISendTransaction,
  ISwapTransaction,
  ITransaction,
  TransactionType,
} from '../../../model/transaction';
import { RpcServiceThorchain } from '../../Rpc/thorchain/RpcServiceThorchain';
import Long from 'long';

export class BlockchainServiceThorchain
  extends BlockchainService
  implements IBlockchainService
{
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
    const specific = new THORChainSpecific();
    const gasInfoSpecific: SpecificThorchain =
      obj.specificTransactionInfo as SpecificThorchain;
    specific.accountNumber = BigInt(gasInfoSpecific.accountNumber);
    specific.fee = BigInt(gasInfoSpecific.fee);
    specific.sequence = BigInt(gasInfoSpecific.sequence);

    switch (obj.transactionType) {
      case TransactionType.SEND:
        specific.isDeposit = false;

        break;
      case TransactionType.DEPOSIT:
        specific.isDeposit = true;

        break;

      default:
        throw new Error(`Unsupported transaction type: ${obj.transactionType}`);
    }

    payload.blockchainSpecific = {
      case: 'thorchainSpecific',
      value: specific,
    };

    return payload;
  }

  isTHORChainSpecific(obj: any): boolean {
    return obj instanceof THORChainSpecific;
  }
  getSwapPreSignedInputData(
    keysignPayload: KeysignPayload,
    signingInput: any
  ): Uint8Array {
    const pubKeyData = Buffer.from(
      keysignPayload.coin?.hexPublicKey || '',
      'hex'
    );
    if (!pubKeyData) {
      throw new Error('invalid hex public key');
    }
    const thorchainSpecific = keysignPayload.blockchainSpecific
      .value as unknown as THORChainSpecific;
    const input = signingInput;
    input.publicKey = pubKeyData;
    input.accountNumber = Number(thorchainSpecific.accountNumber);
    input.sequence = Number(thorchainSpecific.sequence);
    input.mode = BroadcastMode.SYNC;
    input.fee = TW.Cosmos.Proto.Fee.create({
      gas: new Long(20000000),
    });
    return TW.Cosmos.Proto.SigningInput.encode(input).finish();
  }
  async getPreSignedInputData(
    keysignPayload: KeysignPayload
  ): Promise<Uint8Array> {
    const walletCore = this.walletCore;
    const coinType = walletCore.CoinType.thorchain;
    if (keysignPayload.coin?.chain !== Chain.THORChain.toString()) {
      throw new Error('Invalid chain');
    }
    const fromAddr = walletCore.AnyAddress.createWithString(
      keysignPayload.coin.address,
      walletCore.CoinType.thorchain
    );
    if (!fromAddr) {
      throw new Error(`${keysignPayload.coin.address} is invalid`);
    }
    const thorchainSpecific = keysignPayload.blockchainSpecific
      .value as unknown as THORChainSpecific;
    const pubKeyData = Buffer.from(keysignPayload.coin.hexPublicKey, 'hex');
    if (!pubKeyData) {
      throw new Error('invalid hex public key');
    }
    let thorchainCoin = TW.Cosmos.Proto.THORChainCoin.create({});
    let message: TW.Cosmos.Proto.Message[];
    if (thorchainSpecific.isDeposit) {
      thorchainCoin = TW.Cosmos.Proto.THORChainCoin.create({
        asset: TW.Cosmos.Proto.THORChainAsset.create({
          chain: 'THOR',
          symbol: 'RUNE',
          ticker: 'RUNE',
          synth: false,
        }),
        decimals: new Long(8),
      });
      const toAmount = Number(keysignPayload.toAmount || '0');
      if (toAmount > 0) {
        thorchainCoin.amount = keysignPayload.toAmount;
      }

      message = [
        TW.Cosmos.Proto.Message.create({
          thorchainDepositMessage:
            TW.Cosmos.Proto.Message.THORChainDeposit.create({
              signer: fromAddr.data(),
              memo: keysignPayload.memo || '',
              coins: [thorchainCoin],
            }),
        }),
      ];
    } else {
      const toAddress = walletCore.AnyAddress.createWithString(
        keysignPayload.toAddress,
        coinType
      );
      if (!toAddress) {
        throw new Error('invalid to address');
      }
      message = [
        TW.Cosmos.Proto.Message.create({
          thorchainSendMessage: TW.Cosmos.Proto.Message.THORChainSend.create({
            fromAddress: fromAddr.data(),
            amounts: [
              TW.Cosmos.Proto.Amount.create({
                denom: 'rune',
                amount: keysignPayload.toAmount,
              }),
            ],
            toAddress: toAddress.data(),
          }),
        }),
      ];
    }

    var chainID = walletCore.CoinTypeExt.chainId(coinType);
    const thorChainId = await RpcServiceThorchain.getTHORChainChainID();
    if (thorChainId && chainID != thorChainId) {
      chainID = thorChainId;
    }

    const input = TW.Cosmos.Proto.SigningInput.create({
      publicKey: new Uint8Array(pubKeyData),
      signingMode: SigningMode.Protobuf,
      chainId: chainID,
      accountNumber: new Long(Number(thorchainSpecific.accountNumber)),
      sequence: new Long(Number(thorchainSpecific.sequence)),
      mode: BroadcastMode.SYNC,
      memo: keysignPayload.memo || '',
      messages: message,
      fee: TW.Cosmos.Proto.Fee.create({
        gas: new Long(20000000),
      }),
    });
    return TW.Cosmos.Proto.SigningInput.encode(input).finish();
  }

  async getSignedTransaction(
    vaultHexPublicKey: string,
    vaultHexChainCode: string,
    data: KeysignPayload | Uint8Array,
    signatures: { [key: string]: tss.KeysignResponse }
  ): Promise<SignedTransactionResult> {
    const walletCore = this.walletCore;
    let inputData: Uint8Array;
    if (data instanceof Uint8Array) {
      inputData = data;
    } else {
      inputData = await this.getPreSignedInputData(data);
    }
    const coinType = walletCore.CoinType.thorchain;
    const addressService = AddressServiceFactory.createAddressService(
      Chain.THORChain,
      walletCore
    );
    const thorPublicKey = await addressService.getDerivedPubKey(
      vaultHexPublicKey,
      vaultHexChainCode,
      walletCore.CoinTypeExt.derivationPath(coinType)
    );
    const publicKeyData = Buffer.from(thorPublicKey, 'hex');
    const publicKey = walletCore.PublicKey.createWithData(
      publicKeyData,
      walletCore.PublicKeyType.secp256k1
    );
    try {
      const hashes = walletCore.TransactionCompiler.preImageHashes(
        coinType,
        inputData
      );
      const preSigningOutput = TxCompiler.Proto.PreSigningOutput.decode(hashes);
      const allSignatures = walletCore.DataVector.create();
      const publicKeys = walletCore.DataVector.create();
      const signatureProvider = new SignatureProvider(walletCore, signatures);
      const signature = signatureProvider.getSignatureWithRecoveryId(
        preSigningOutput.dataHash
      );
      if (!publicKey.verify(signature, preSigningOutput.dataHash)) {
        throw new Error('Invalid signature');
      }
      allSignatures.add(signature);
      publicKeys.add(publicKeyData);
      const compileWithSignatures =
        walletCore.TransactionCompiler.compileWithSignatures(
          coinType,
          inputData,
          allSignatures,
          publicKeys
        );
      const output = TW.Cosmos.Proto.SigningOutput.decode(
        compileWithSignatures
      );
      const serializedData = output.serialized;
      const parsedData = JSON.parse(serializedData);
      const txBytes = parsedData.tx_bytes;
      const decodedTxBytes = Buffer.from(txBytes, 'base64');
      const hash = createHash('sha256')
        .update(decodedTxBytes as any)
        .digest('hex');
      const result = new SignedTransactionResult(
        serializedData,
        hash,
        undefined
      );
      return result;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}

/* eslint-disable */
import { TW } from '@trustwallet/wallet-core';
import { tss } from '../../../../wailsjs/go/models';
import { MAYAChainSpecific } from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
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
import Long from 'long';

export class BlockchainServiceMaya
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
    const specific = new MAYAChainSpecific();
    const gasInfoSpecific: SpecificThorchain =
      obj.specificTransactionInfo as SpecificThorchain;
    specific.accountNumber = BigInt(gasInfoSpecific.accountNumber);
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
      case: 'mayaSpecific',
      value: specific,
    };

    return payload;
  }

  async getPreSignedInputData(
    keysignPayload: KeysignPayload
  ): Promise<Uint8Array> {
    const walletCore = this.walletCore;
    const coinType = walletCore.CoinType.thorchain;
    if (keysignPayload.coin?.chain !== Chain.MayaChain.toString()) {
      throw new Error('Invalid chain');
    }

    const fromAddr = walletCore.AnyAddress.createBech32(
      keysignPayload.coin.address,
      walletCore.CoinType.thorchain,
      'maya'
    );

    if (keysignPayload.coin.address !== fromAddr.description()) {
      throw new Error(`${keysignPayload.coin.address} is invalid`);
    }

    if (!fromAddr) {
      throw new Error(`${keysignPayload.coin.address} is invalid`);
    }

    const thorchainSpecific = keysignPayload.blockchainSpecific
      .value as unknown as MAYAChainSpecific;

    const pubKeyData = Buffer.from(keysignPayload.coin.hexPublicKey, 'hex');
    if (!pubKeyData) {
      throw new Error('invalid hex public key');
    }

    let thorchainCoin = TW.Cosmos.Proto.THORChainCoin.create({});
    let message: TW.Cosmos.Proto.Message[];

    if (thorchainSpecific.isDeposit) {
      thorchainCoin = TW.Cosmos.Proto.THORChainCoin.create({
        asset: TW.Cosmos.Proto.THORChainAsset.create({
          chain: 'MAYA',
          symbol: 'CACAO',
          ticker: 'CACAO',
          synth: false,
        }),
        decimals: new Long(keysignPayload.coin.decimals),
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
      const toAddress = walletCore.AnyAddress.createBech32(
        keysignPayload.toAddress,
        coinType,
        'maya'
      );

      if (toAddress.description() !== keysignPayload.toAddress) {
        throw new Error('To address is different from the bech32 address');
      }

      if (!toAddress) {
        throw new Error('invalid to address');
      }

      message = [
        TW.Cosmos.Proto.Message.create({
          thorchainSendMessage: TW.Cosmos.Proto.Message.THORChainSend.create({
            fromAddress: fromAddr.data(),
            amounts: [
              TW.Cosmos.Proto.Amount.create({
                denom: keysignPayload.coin.ticker.toLowerCase(),
                amount: keysignPayload.toAmount,
              }),
            ],
            toAddress: toAddress.data(),
          }),
        }),
      ];
    }

    const input = TW.Cosmos.Proto.SigningInput.create({
      publicKey: new Uint8Array(pubKeyData),
      signingMode: SigningMode.Protobuf,
      chainId: 'mayachain-mainnet-v1',
      accountNumber: new Long(Number(thorchainSpecific.accountNumber)),
      sequence: new Long(Number(thorchainSpecific.sequence)),
      mode: BroadcastMode.SYNC,
      memo: keysignPayload.memo || '',
      messages: message,
      fee: TW.Cosmos.Proto.Fee.create({
        gas: new Long(2000000000),
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
      Chain.MayaChain,
      walletCore
    );
    const publicKey = await addressService.getPublicKey(
      vaultHexPublicKey,
      '',
      vaultHexChainCode
    );
    const publicKeyData = publicKey.data();

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

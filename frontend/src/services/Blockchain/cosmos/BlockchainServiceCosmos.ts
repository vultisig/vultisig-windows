import { TW } from '@trustwallet/wallet-core';

import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { IBlockchainService } from '../IBlockchainService';
import { SignedTransactionResult } from '../signed-transaction-result';
import SigningMode = TW.Cosmos.Proto.SigningMode;
import BroadcastMode = TW.Cosmos.Proto.BroadcastMode;
import TxCompiler = TW.TxCompiler;
import { createHash } from 'crypto';
import Long from 'long';

import { tss } from '../../../../wailsjs/go/models';
import { hexEncode } from '../../../chain/walletCore/hexEncode';
import {
  CosmosSpecific,
  TransactionType,
} from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { SpecificCosmos } from '../../../model/specific-transaction-info';
import { ISendTransaction, ITransaction } from '../../../model/transaction';
import { AddressServiceFactory } from '../../Address/AddressServiceFactory';
import { RpcServiceFactory } from '../../Rpc/RpcServiceFactory';
import { BlockchainService } from '../BlockchainService';
import SignatureProvider from '../signature-provider';

export class BlockchainServiceCosmos
  extends BlockchainService
  implements IBlockchainService
{
  createKeysignPayload(
    obj: ITransaction | ISendTransaction,
    localPartyId: string,
    publicKeyEcdsa: string
  ): KeysignPayload {
    const payload: KeysignPayload = super.createKeysignPayload(
      obj,
      localPartyId,
      publicKeyEcdsa
    );
    const specific = new CosmosSpecific();
    const gasInfoSpecific: SpecificCosmos =
      obj.specificTransactionInfo as SpecificCosmos;
    specific.accountNumber = BigInt(gasInfoSpecific.accountNumber);
    specific.sequence = BigInt(gasInfoSpecific.sequence);
    specific.gas = BigInt(gasInfoSpecific.gas);
    specific.transactionType = gasInfoSpecific.transactionType;

    payload.blockchainSpecific = {
      case: 'cosmosSpecific',
      value: specific,
    };

    return payload;
  }

  async getPreSignedInputData(
    keysignPayload: KeysignPayload
  ): Promise<Uint8Array> {
    const walletCore = this.walletCore;

    const cosmosSpecific = keysignPayload.blockchainSpecific
      .value as unknown as CosmosSpecific;

    if (!keysignPayload.coin) {
      throw new Error('keysignPayload.coin is undefined');
    }

    const pubKeyData = Buffer.from(keysignPayload.coin.hexPublicKey, 'hex');
    if (!pubKeyData) {
      throw new Error('invalid hex public key');
    }

    const toAddress = walletCore.AnyAddress.createWithString(
      keysignPayload.toAddress,
      this.coinType
    );

    if (!toAddress) {
      throw new Error('invalid to address');
    }

    const rpcService = RpcServiceFactory.createRpcService(this.chain) as any;
    const denom = rpcService.denom();

    if (!denom) {
      console.error('getPreSignedInputData > denom is not defined');
      throw new Error('getPreSignedInputData > denom is not defined');
    }
    const message: TW.Cosmos.Proto.Message[] = [
      TW.Cosmos.Proto.Message.create({
        sendCoinsMessage: TW.Cosmos.Proto.Message.Send.create({
          fromAddress: keysignPayload.coin.address,
          toAddress: keysignPayload.toAddress,
          amounts: [
            TW.Cosmos.Proto.Amount.create({
              amount: keysignPayload.toAmount,
              denom: keysignPayload.coin.isNativeToken
                ? denom
                : keysignPayload.coin.contractAddress,
            }),
          ],
        }),
      }),
    ];

    const input = TW.Cosmos.Proto.SigningInput.create({
      publicKey: new Uint8Array(pubKeyData),
      signingMode: SigningMode.Protobuf,
      chainId: walletCore.CoinTypeExt.chainId(this.coinType),
      accountNumber: new Long(Number(cosmosSpecific.accountNumber)),
      sequence: new Long(Number(cosmosSpecific.sequence)),
      mode: BroadcastMode.SYNC,
      memo:
        cosmosSpecific.transactionType !== TransactionType.VOTE
          ? keysignPayload.memo || ''
          : '',
      messages: message,
      fee: TW.Cosmos.Proto.Fee.create({
        gas: new Long(200000),
        amounts: [
          TW.Cosmos.Proto.Amount.create({
            amount: cosmosSpecific.gas.toString(),
            denom: denom,
          }),
        ],
      }),
    });

    return TW.Cosmos.Proto.SigningInput.encode(input).finish();
  }

  async getPreSignedImageHash(
    keysignPayload: KeysignPayload
  ): Promise<string[]> {
    const walletCore = this.walletCore;
    const inputData = await this.getPreSignedInputData(keysignPayload);
    const hashes = walletCore.TransactionCompiler.preImageHashes(
      this.coinType,
      inputData
    );
    const preSigningOutput = TxCompiler.Proto.PreSigningOutput.decode(hashes);
    if (preSigningOutput.errorMessage !== '') {
      console.error('preSigningOutput error:', preSigningOutput.errorMessage);
      throw new Error(preSigningOutput.errorMessage);
    }

    return [
      hexEncode({
        value: preSigningOutput.dataHash,
        walletCore: walletCore,
      }),
    ];
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

    const addressService = AddressServiceFactory.createAddressService(
      this.chain,
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
        this.coinType,
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
          this.coinType,
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

import { TW } from '@trustwallet/wallet-core';

import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { IBlockchainService } from '../IBlockchainService';
import { SignedTransactionResult } from '../signed-transaction-result';
import SigningMode = TW.Cosmos.Proto.SigningMode;
import BroadcastMode = TW.Cosmos.Proto.BroadcastMode;
import { createHash } from 'crypto';
import Long from 'long';

import { tss } from '../../../../wailsjs/go/models';
import { cosmosFeeCoinDenom } from '../../../chain/cosmos/cosmosFeeCoinDenom';
import { getPreSigningHashes } from '../../../chain/tx/utils/getPreSigningHashes';
import { assertSignature } from '../../../chain/utils/assertSignature';
import { generateSignatureWithRecoveryId } from '../../../chain/utils/generateSignatureWithRecoveryId';
import { hexEncode } from '../../../chain/walletCore/hexEncode';
import {
  CosmosSpecific,
  TransactionType,
} from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { CosmosChain } from '../../../model/chain';
import { toWalletCorePublicKey } from '../../../vault/publicKey/toWalletCorePublicKey';
import { VaultPublicKey } from '../../../vault/publicKey/VaultPublicKey';
import { BlockchainService } from '../BlockchainService';

export class BlockchainServiceCosmos
  extends BlockchainService
  implements IBlockchainService
{
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

    const denom = cosmosFeeCoinDenom[this.chain as CosmosChain];

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

  async getSignedTransaction(
    vaultPublicKey: VaultPublicKey,
    txInputData: Uint8Array,
    signatures: { [key: string]: tss.KeysignResponse }
  ): Promise<SignedTransactionResult> {
    const walletCore = this.walletCore;

    const publicKey = await toWalletCorePublicKey({
      chain: this.chain,
      walletCore: this.walletCore,
      value: vaultPublicKey,
    });
    const publicKeyData = publicKey.data();

    const [dataHash] = getPreSigningHashes({
      walletCore,
      txInputData,
      chain: this.chain,
    });

    const allSignatures = walletCore.DataVector.create();
    const publicKeys = walletCore.DataVector.create();

    const signature = generateSignatureWithRecoveryId({
      walletCore,
      signature: signatures[hexEncode({ value: dataHash, walletCore })],
    });

    assertSignature({
      publicKey,
      message: dataHash,
      signature,
    });

    allSignatures.add(signature);
    publicKeys.add(publicKeyData);

    const compileWithSignatures =
      walletCore.TransactionCompiler.compileWithSignatures(
        this.coinType,
        txInputData,
        allSignatures,
        publicKeys
      );
    const output = TW.Cosmos.Proto.SigningOutput.decode(compileWithSignatures);

    const serializedData = output.serialized;
    const parsedData = JSON.parse(serializedData);
    const txBytes = parsedData.tx_bytes;
    const decodedTxBytes = Buffer.from(txBytes, 'base64');
    const hash = createHash('sha256')
      .update(decodedTxBytes as any)
      .digest('hex');
    const result = new SignedTransactionResult(serializedData, hash, undefined);
    return result;
  }
}

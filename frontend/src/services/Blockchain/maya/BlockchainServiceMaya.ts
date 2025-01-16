import { TW } from '@trustwallet/wallet-core';

import { tss } from '../../../../wailsjs/go/models';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { Chain } from '../../../model/chain';
import {
  IBlockchainService,
  SignedTransactionResult,
} from '../IBlockchainService';
import SigningMode = TW.Cosmos.Proto.SigningMode;
import BroadcastMode = TW.Cosmos.Proto.BroadcastMode;
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core';
import { createHash } from 'crypto';
import Long from 'long';

import { getBlockchainSpecificValue } from '../../../chain/keysign/KeysignChainSpecific';
import { mayaConfig } from '../../../chain/maya/config';
import { getPreSigningHashes } from '../../../chain/tx/utils/getPreSigningHashes';
import { assertSignature } from '../../../chain/utils/assertSignature';
import { generateSignatureWithRecoveryId } from '../../../chain/utils/generateSignatureWithRecoveryId';
import { getCoinType } from '../../../chain/walletCore/getCoinType';
import { hexEncode } from '../../../chain/walletCore/hexEncode';
import { BlockchainService } from '../BlockchainService';

export class BlockchainServiceMaya
  extends BlockchainService
  implements IBlockchainService
{
  async getPreSignedInputData(
    keysignPayload: KeysignPayload
  ): Promise<Uint8Array> {
    const walletCore = this.walletCore;
    const coinType = getCoinType({
      walletCore,
      chain: this.chain,
    });
    if (keysignPayload.coin?.chain !== Chain.MayaChain.toString()) {
      throw new Error('Invalid chain');
    }

    const fromAddr = walletCore.AnyAddress.createBech32(
      keysignPayload.coin.address,
      coinType,
      'maya'
    );

    if (keysignPayload.coin.address !== fromAddr.description()) {
      throw new Error(`${keysignPayload.coin.address} is invalid`);
    }

    if (!fromAddr) {
      throw new Error(`${keysignPayload.coin.address} is invalid`);
    }

    const mayaSpecific = getBlockchainSpecificValue(
      keysignPayload.blockchainSpecific,
      'mayaSpecific'
    );

    const pubKeyData = Buffer.from(keysignPayload.coin.hexPublicKey, 'hex');
    if (!pubKeyData) {
      throw new Error('invalid hex public key');
    }

    let thorchainCoin = TW.Cosmos.Proto.THORChainCoin.create({});
    let message: TW.Cosmos.Proto.Message[];

    if (mayaSpecific.isDeposit) {
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
      accountNumber: new Long(Number(mayaSpecific.accountNumber)),
      sequence: new Long(Number(mayaSpecific.sequence)),
      mode: BroadcastMode.SYNC,
      memo: keysignPayload.memo || '',
      messages: message,
      fee: TW.Cosmos.Proto.Fee.create({
        gas: new Long(Number(mayaConfig.fee)),
      }),
    });

    return TW.Cosmos.Proto.SigningInput.encode(input).finish();
  }

  async getSignedTransaction(
    publicKey: PublicKey,
    txInputData: Uint8Array,
    signatures: { [key: string]: tss.KeysignResponse }
  ): Promise<SignedTransactionResult> {
    const walletCore = this.walletCore;

    const coinType = getCoinType({
      walletCore,
      chain: this.chain,
    });

    const publicKeyData = publicKey.data();

    const allSignatures = walletCore.DataVector.create();
    const publicKeys = walletCore.DataVector.create();
    const [dataHash] = getPreSigningHashes({
      walletCore,
      chain: Chain.MayaChain,
      txInputData,
    });

    const signature = generateSignatureWithRecoveryId({
      walletCore: this.walletCore,
      signature:
        signatures[hexEncode({ value: dataHash, walletCore: this.walletCore })],
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
        coinType,
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

    return {
      rawTx: serializedData,
      txHash: hash,
    };
  }
}

import { TW } from '@trustwallet/wallet-core';

import { tss } from '../../../../wailsjs/go/models';
import { THORChainSpecific } from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { Chain } from '../../../model/chain';
import { IBlockchainService } from '../IBlockchainService';
import { SignedTransactionResult } from '../signed-transaction-result';
import SigningMode = TW.Cosmos.Proto.SigningMode;
import BroadcastMode = TW.Cosmos.Proto.BroadcastMode;
import { createHash } from 'crypto';
import Long from 'long';

import { getPreSigningHashes } from '../../../chain/tx/utils/getPreSigningHashes';
import { assertSignature } from '../../../chain/utils/assertSignature';
import { generateSignatureWithRecoveryId } from '../../../chain/utils/generateSignatureWithRecoveryId';
import { getCoinType } from '../../../chain/walletCore/getCoinType';
import { hexEncode } from '../../../chain/walletCore/hexEncode';
import { toWalletCorePublicKey } from '../../../vault/publicKey/toWalletCorePublicKey';
import { VaultPublicKey } from '../../../vault/publicKey/VaultPublicKey';
import { RpcServiceThorchain } from '../../Rpc/thorchain/RpcServiceThorchain';
import { BlockchainService } from '../BlockchainService';

export class BlockchainServiceThorchain
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
    if (keysignPayload.coin?.chain !== Chain.THORChain.toString()) {
      throw new Error('Invalid chain');
    }

    const fromAddr = walletCore.AnyAddress.createWithString(
      keysignPayload.coin.address,
      coinType
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

    let chainID = walletCore.CoinTypeExt.chainId(coinType);
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
    vaultPublicKey: VaultPublicKey,
    txInputData: Uint8Array,
    signatures: { [key: string]: tss.KeysignResponse }
  ): Promise<SignedTransactionResult> {
    const walletCore = this.walletCore;
    const coinType = getCoinType({
      walletCore,
      chain: this.chain,
    });

    const publicKey = await toWalletCorePublicKey({
      walletCore,
      chain: Chain.THORChain,
      value: vaultPublicKey,
    });

    try {
      const [dataHash] = getPreSigningHashes({
        walletCore: walletCore,
        txInputData,
        chain: Chain.THORChain,
      });
      const allSignatures = walletCore.DataVector.create();
      const publicKeys = walletCore.DataVector.create();

      const signature = generateSignatureWithRecoveryId({
        walletCore: this.walletCore,
        signature:
          signatures[
            hexEncode({ value: dataHash, walletCore: this.walletCore })
          ],
      });

      assertSignature({
        publicKey,
        signature,
        message: dataHash,
      });

      allSignatures.add(signature);
      publicKeys.add(publicKey.data());
      const compileWithSignatures =
        walletCore.TransactionCompiler.compileWithSignatures(
          coinType,
          txInputData,
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

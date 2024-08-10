import { KeysignPayload } from '../gen/vultisig/keysign/v1/keysign_message_pb';
import { Chain } from '../model/chain';
import { WalletCore, TW } from '@trustwallet/wallet-core';
import { THORChainSpecific } from '../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { tss } from '../../wailsjs/go/models';
import SigningMode = TW.Cosmos.Proto.SigningMode;
import BroadcastMode = TW.Cosmos.Proto.BroadcastMode;
import TxCompiler = TW.TxCompiler;
import PublicKeyHelper from './public_key_helper';
import SignatureProvider from './signature_provider';
import { createHash } from 'crypto';
import { SignedTransactionResult } from './signed-transaction-result';

class THORChainHelper {
  private walletCore: WalletCore;
  constructor(walletCore: WalletCore) {
    this.walletCore = walletCore;
  }

  isTHORChainSpecific(obj: any): boolean {
    return obj instanceof THORChainSpecific;
  }

  getSwapPreSignedInputData(
    keysignPayload: KeysignPayload,
    signingInput: TW.Cosmos.Proto.SigningInput
  ): Uint8Array {
    if (!this.isTHORChainSpecific(keysignPayload.blockchainSpecific)) {
      throw new Error('Invalid blockchain specific');
    }
    const pubKeyData = Buffer.from(
      keysignPayload.coin?.hexPublicKey || '',
      'hex'
    );
    if (!pubKeyData) {
      throw new Error('invalid hex public key');
    }
    const thorchainSpecific =
      keysignPayload.blockchainSpecific as unknown as THORChainSpecific;
    const input = signingInput;
    input.publicKey = pubKeyData;
    input.accountNumber = thorchainSpecific.accountNumber;
    input.sequence = thorchainSpecific.sequence;
    input.mode = BroadcastMode.SYNC;
    input.fee = TW.Cosmos.Proto.Fee.create({
      gas: 20000000,
    });
    return TW.Cosmos.Proto.SigningInput.encode(input).finish();
  }

  getPreSignedInputData(keysignPayload: KeysignPayload): Uint8Array {
    const coinType = this.walletCore.CoinType.thorchain;
    if (keysignPayload.coin?.chain !== Chain.THORChain.toString()) {
      throw new Error('Invalid chain');
    }
    const fromAddr = this.walletCore.AnyAddress.createWithString(
      keysignPayload.coin.address,
      this.walletCore.CoinType.thorchain
    );
    if (!fromAddr) {
      throw new Error(`${keysignPayload.coin.address} is invalid`);
    }
    if (!this.isTHORChainSpecific(keysignPayload.blockchainSpecific.value)) {
      throw new Error('Invalid blockchain specific');
    }
    const thorchainSpecific =
      keysignPayload.blockchainSpecific as unknown as THORChainSpecific;
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
        decimals: 8,
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
              memo: keysignPayload.memo,
              coins: [thorchainCoin],
            }),
        }),
      ];
    } else {
      const toAddress = this.walletCore.AnyAddress.createWithString(
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
    const input = TW.Cosmos.Proto.SigningInput.create({
      publicKey: pubKeyData,
      signingMode: SigningMode.Protobuf,
      chainId: this.walletCore.CoinTypeExt.chainId(coinType),
      accountNumber: thorchainSpecific.accountNumber,
      sequence: thorchainSpecific.sequence,
      mode: BroadcastMode.SYNC,
      memo: keysignPayload.memo,
      messages: message,
      fee: TW.Cosmos.Proto.Fee.create({
        gas: 20000000,
      }),
    });
    return TW.Cosmos.Proto.SigningInput.encode(input).finish();
  }

  getPreSignedImageHash(keysignPayload: KeysignPayload): [string] {
    const coinType = this.walletCore.CoinType.thorchain;
    const inputData = this.getPreSignedInputData(keysignPayload);
    const hashes = this.walletCore.TransactionCompiler.preImageHashes(
      coinType,
      inputData
    );
    const preSigningOutput = TxCompiler.Proto.PreSigningOutput.decode(hashes);
    if (preSigningOutput.errorMessage !== '') {
      console.log('preSigningOutput error:', preSigningOutput.errorMessage);
      throw new Error(preSigningOutput.errorMessage);
    }
    return [this.walletCore.HexCoding.encode(preSigningOutput.dataHash)];
  }

  async getSignedTransaction(
    vaultHexPublicKey: string,
    vaultHexChainCode: string,
    inputData: Uint8Array,
    signatures: { [key: string]: tss.KeysignResponse }
  ): Promise<SignedTransactionResult> {
    const coinType = this.walletCore.CoinType.thorchain;
    const thorPublicKey = await PublicKeyHelper.getDerivedPubKey(
      vaultHexPublicKey,
      vaultHexChainCode,
      this.walletCore.CoinTypeExt.derivationPath(coinType)
    );
    const publicKeyData = Buffer.from(thorPublicKey, 'hex');
    const publicKey = this.walletCore.PublicKey.createWithData(
      publicKeyData,
      this.walletCore.PublicKeyType.secp256k1
    );
    try {
      const hashes = this.walletCore.TransactionCompiler.preImageHashes(
        coinType,
        inputData
      );
      const preSigningOutput = TxCompiler.Proto.PreSigningOutput.decode(hashes);
      const allSignatures = this.walletCore.DataVector.create();
      const publicKeys = this.walletCore.DataVector.create();
      const signatureProvider = new SignatureProvider(
        this.walletCore,
        signatures
      );
      const signature = signatureProvider.getSignatureWithRecoveryId(
        preSigningOutput.dataHash
      );
      if (!publicKey.verify(signature, preSigningOutput.dataHash)) {
        throw new Error('Invalid signature');
      }
      allSignatures.add(signature);
      publicKeys.add(publicKeyData);
      const compileWithSignatures =
        this.walletCore.TransactionCompiler.compileWithSignatures(
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
      const hash = createHash('sha256').update(decodedTxBytes).digest('hex');
      const result = new SignedTransactionResult(
        serializedData,
        hash,
        undefined
      );
      return result;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}

export default THORChainHelper;

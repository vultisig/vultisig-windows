import { TW, WalletCore } from '@trustwallet/wallet-core';
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

export class BlockchainServiceThorchain implements IBlockchainService {
  private chain: Chain;
  private walletCore: WalletCore;
  constructor(chain: Chain, walletCore: WalletCore) {
    this.chain = chain;
    this.walletCore = walletCore;
  }
  isTHORChainSpecific(obj: any): boolean {
    return obj instanceof THORChainSpecific;
  }
  getSwapPreSignedInputData(
    keysignPayload: KeysignPayload,
    signingInput: any
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
    const input = TW.Cosmos.Proto.SigningInput.create({
      publicKey: pubKeyData,
      signingMode: SigningMode.Protobuf,
      chainId: walletCore.CoinTypeExt.chainId(coinType),
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
  async getPreSignedImageHash(
    keysignPayload: KeysignPayload
  ): Promise<string[]> {
    const walletCore = this.walletCore;
    const coinType = walletCore.CoinType.thorchain;
    const inputData = await this.getPreSignedInputData(keysignPayload);
    const hashes = walletCore.TransactionCompiler.preImageHashes(
      coinType,
      inputData
    );
    const preSigningOutput = TxCompiler.Proto.PreSigningOutput.decode(hashes);
    if (preSigningOutput.errorMessage !== '') {
      console.log('preSigningOutput error:', preSigningOutput.errorMessage);
      throw new Error(preSigningOutput.errorMessage);
    }
    return [
      walletCore.HexCoding.encode(preSigningOutput.dataHash).substring(2),
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
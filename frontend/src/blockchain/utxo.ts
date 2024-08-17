import { TW, WalletCore } from '@trustwallet/wallet-core';
import { Coin } from '../gen/vultisig/keysign/v1/coin_pb';
import { Chain, ChainUtils } from '../model/chain';
import { Vault } from '../gen/vultisig/vault/v1/vault_pb';
import { KeysignPayload } from '../gen/vultisig/keysign/v1/keysign_message_pb';
import { UTXOSpecific } from '../gen/vultisig/keysign/v1/blockchain_specific_pb';
import Long from 'long';
import { SignedTransactionResult } from './signed-transaction-result';
import { tss } from '../../wailsjs/go/models';
import PublicKeyHelper from './public-key-helper';
import SignatureProvider from './signature-provider';
export class UTXOHelper {
  private walletCore: WalletCore;
  private coinType: any;
  private vaultHexPublicKey: string;
  private vaultHexChainCode: string;

  constructor(
    walletCore: WalletCore,
    coinType: any,
    vaultHexPublicKey: string,
    vaultHexChainCode: string
  ) {
    this.walletCore = walletCore;
    this.coinType = coinType;
    this.vaultHexPublicKey = vaultHexPublicKey;
    this.vaultHexChainCode = vaultHexChainCode;
  }

  static getHelper(
    walletCore: WalletCore,
    coin: Coin,
    vault: Vault
  ): UTXOHelper {
    const chain = ChainUtils.stringToChain(coin.chain);
    if (chain === undefined) {
      throw new Error('Invalid chain');
    }
    switch (chain) {
      case Chain.Bitcoin:
        return new UTXOHelper(
          walletCore,
          walletCore.CoinType.bitcoin,
          vault.publicKeyEcdsa,
          vault.hexChainCode
        );
      case Chain.BitcoinCash:
        return new UTXOHelper(
          walletCore,
          walletCore.CoinType.bitcoinCash,
          vault.publicKeyEcdsa,
          vault.hexChainCode
        );
      case Chain.Litecoin:
        return new UTXOHelper(
          walletCore,
          walletCore.CoinType.litecoin,
          vault.publicKeyEcdsa,
          vault.hexChainCode
        );
      case Chain.Dogecoin:
        return new UTXOHelper(
          walletCore,
          walletCore.CoinType.dogecoin,
          vault.publicKeyEcdsa,
          vault.hexChainCode
        );
      case Chain.Dash:
        return new UTXOHelper(
          walletCore,
          walletCore.CoinType.dash,
          vault.publicKeyEcdsa,
          vault.hexChainCode
        );
      default:
        throw new Error('Unsupported chain');
    }
  }
  getPreSignedImageHash(keysignPayload: KeysignPayload): string[] {
    const input = this.getBitcoinPreSigningInputData(keysignPayload);
    const preHashes = this.walletCore.TransactionCompiler.preImageHashes(
      this.coinType,
      input
    );
    const preSignOutputs = TW.Bitcoin.Proto.PreSigningOutput.decode(preHashes);
    if (preSignOutputs.errorMessage !== '') {
      throw new Error(preSignOutputs.errorMessage);
    }
    const result: string[] = [];
    for (const hash of preSignOutputs.hashPublicKeys) {
      if (
        hash === undefined ||
        hash.dataHash === undefined ||
        hash.dataHash === null
      ) {
        continue;
      }
      result.push(
        this.walletCore.HexCoding.encode(hash.dataHash).stripHexPrefix()
      );
    }
    return result;
  }

  getSigningInputData(
    keysignPayload: KeysignPayload,
    signingInput: TW.Bitcoin.Proto.ISigningInput
  ): Uint8Array {
    if (keysignPayload.blockchainSpecific instanceof UTXOSpecific) {
      throw new Error('Invalid blockchain specific');
    }
    if (keysignPayload.coin === undefined) {
      throw new Error('Invalid coin');
    }
    const utxoSpecific = keysignPayload.blockchainSpecific as unknown as {
      case: 'utxoSpecific';
      value: UTXOSpecific;
    };
    const { byteFee, sendMaxAmount } = utxoSpecific.value;
    const input = signingInput;
    input.byteFee = Long.fromString(byteFee);
    input.hashType = this.walletCore.BitcoinScript.hashTypeForCoin(
      this.coinType
    );
    input.useMaxAmount = sendMaxAmount;
    input.utxo = input.utxo || [];
    for (const utxo of keysignPayload.utxoInfo) {
      const lockScript = this.walletCore.BitcoinScript.lockScriptForAddress(
        keysignPayload.coin.address,
        this.coinType
      );
      switch (this.coinType) {
        case this.walletCore.CoinType.bitcoin:
        case this.walletCore.CoinType.litecoin: {
          const segWitPubKeyHash = lockScript.matchPayToWitnessPublicKeyHash();
          const redeemScript =
            this.walletCore.BitcoinScript.buildPayToWitnessPubkeyHash(
              segWitPubKeyHash
            );
          input.scripts = input.scripts || {};
          input.scripts[
            this.walletCore.HexCoding.encode(segWitPubKeyHash).stripHexPrefix()
          ] = redeemScript.data();
          break;
        }
        case this.walletCore.CoinType.bitcoinCash:
        case this.walletCore.CoinType.dash:
        case this.walletCore.CoinType.dogecoin: {
          const keyHash = lockScript.matchPayToPubkeyHash();
          const redeemScriptPubKey =
            this.walletCore.BitcoinScript.buildPayToPublicKeyHash(keyHash);
          input.scripts = input.scripts || {};
          input.scripts[
            this.walletCore.HexCoding.encode(keyHash).stripHexPrefix()
          ] = redeemScriptPubKey.data();
          break;
        }
        default:
          throw new Error('Unsupported coin type');
      }
      const unspendTransaction = TW.Bitcoin.Proto.UnspentTransaction.create({
        amount: Long.fromString(utxo.amount.toString()),
        outPoint: TW.Bitcoin.Proto.OutPoint.create({
          hash: this.walletCore.HexCoding.decode(utxo.hash).reverse(),
          index: utxo.index,
          sequence: 0xffffffff,
        }),
        script: lockScript.data(),
      });
      input.utxo.push(unspendTransaction);
    }
    return TW.Bitcoin.Proto.SigningInput.encode(input).finish();
  }

  getBitcoinPreSigningInputData(keysignPayload: KeysignPayload): Uint8Array {
    const input = this.getBitcoinSigningInput(keysignPayload);
    const inputData = TW.Bitcoin.Proto.SigningInput.encode(input).finish();
    const plan = this.walletCore.AnySigner.plan(inputData, this.coinType);
    input.plan = TW.Bitcoin.Proto.TransactionPlan.decode(plan);
    return TW.Bitcoin.Proto.SigningInput.encode(input).finish();
  }

  getBitcoinSigningInput(
    keysignPayload: KeysignPayload
  ): TW.Bitcoin.Proto.SigningInput {
    if (keysignPayload.blockchainSpecific instanceof UTXOSpecific) {
      throw new Error('Invalid blockchain specific');
    }
    if (keysignPayload.coin === undefined) {
      throw new Error('Invalid coin');
    }
    const utxoSpecific = keysignPayload.blockchainSpecific as unknown as {
      case: 'utxoSpecific';
      value: UTXOSpecific;
    };
    const { byteFee, sendMaxAmount } = utxoSpecific.value;
    const input = TW.Bitcoin.Proto.SigningInput.create({
      hashType: this.walletCore.BitcoinScript.hashTypeForCoin(this.coinType),
      amount: Long.fromString(keysignPayload.toAmount),
      useMaxAmount: sendMaxAmount,
      toAddress: keysignPayload.toAddress,
      changeAddress: keysignPayload.coin?.address,
      byteFee: Long.fromString(byteFee),
      coinType: this.coinType.value,
    });
    const encoder = new TextEncoder();
    const memo = keysignPayload.memo || '';
    if (memo != '') {
      input.outputOpReturn = encoder.encode(keysignPayload.memo);
    }
    for (const utxo of keysignPayload.utxoInfo) {
      const lockScript = this.walletCore.BitcoinScript.lockScriptForAddress(
        keysignPayload.coin.address,
        this.coinType
      );
      switch (this.coinType) {
        case this.walletCore.CoinType.bitcoin:
        case this.walletCore.CoinType.litecoin: {
          const segWitPubKeyHash = lockScript.matchPayToWitnessPublicKeyHash();
          const redeemScript =
            this.walletCore.BitcoinScript.buildPayToWitnessPubkeyHash(
              segWitPubKeyHash
            );
          input.scripts[
            this.walletCore.HexCoding.encode(segWitPubKeyHash).stripHexPrefix()
          ] = redeemScript.data();
          break;
        }
        case this.walletCore.CoinType.bitcoinCash:
        case this.walletCore.CoinType.dash:
        case this.walletCore.CoinType.dogecoin: {
          const keyHash = lockScript.matchPayToPubkeyHash();
          const redeemScriptPubKey =
            this.walletCore.BitcoinScript.buildPayToPublicKeyHash(keyHash);
          input.scripts[
            this.walletCore.HexCoding.encode(keyHash).stripHexPrefix()
          ] = redeemScriptPubKey.data();
          break;
        }
        default:
          throw new Error('Unsupported coin type');
      }
      const unspendTransaction = TW.Bitcoin.Proto.UnspentTransaction.create({
        amount: Long.fromString(utxo.amount.toString()),
        outPoint: TW.Bitcoin.Proto.OutPoint.create({
          hash: this.walletCore.HexCoding.decode(utxo.hash).reverse(),
          index: utxo.index,
          sequence: 0xffffffff,
        }),
        script: lockScript.data(),
      });
      input.utxo.push(unspendTransaction);
    }
    return input;
  }

  getBitcoinTransactionPlan(
    keysignPayload: KeysignPayload
  ): TW.Bitcoin.Proto.TransactionPlan {
    const input = this.getBitcoinPreSigningInputData(keysignPayload);
    const plan = this.walletCore.AnySigner.plan(input, this.coinType);
    return TW.Bitcoin.Proto.TransactionPlan.decode(plan);
  }

  async getSignedTransaction(
    data: Uint8Array | KeysignPayload,
    signatures: { [key: string]: tss.KeysignResponse }
  ): Promise<SignedTransactionResult> {
    let inputData: Uint8Array;
    if (data instanceof Uint8Array) {
      inputData = data;
    } else {
      inputData = this.getBitcoinPreSigningInputData(data);
    }
    const utxoPublicKey = await PublicKeyHelper.getDerivedPubKey(
      this.vaultHexPublicKey,
      this.vaultHexChainCode,
      this.walletCore.CoinTypeExt.derivationPath(this.coinType)
    );
    const publicKeyData = Buffer.from(utxoPublicKey, 'hex');
    const publicKey = this.walletCore.PublicKey.createWithData(
      publicKeyData,
      this.walletCore.PublicKeyType.secp256k1
    );
    const preHashes = this.walletCore.TransactionCompiler.preImageHashes(
      this.coinType,
      inputData
    );
    const preSignOutputs = TW.Bitcoin.Proto.PreSigningOutput.decode(preHashes);
    const allSignatures = this.walletCore.DataVector.create();
    const publicKeys = this.walletCore.DataVector.create();
    const signatureProvider = new SignatureProvider(
      this.walletCore,
      signatures
    );
    for (const hash of preSignOutputs.hashPublicKeys) {
      if (
        hash === undefined ||
        hash.dataHash === undefined ||
        hash.dataHash === null
      ) {
        continue;
      }
      const preImageHash = hash.dataHash;
      const signature = signatureProvider.getDerSignature(preImageHash);
      if (signature === undefined) {
        continue;
      }
      if (!publicKey.verifyAsDER(signature, preImageHash)) {
        throw new Error('fail to verify signature');
      }
      allSignatures.add(signature);
      publicKeys.add(publicKeyData);
    }
    const compileWithSignatures =
      this.walletCore.TransactionCompiler.compileWithSignatures(
        this.coinType,
        inputData,
        allSignatures,
        publicKeys
      );
    const output = TW.Bitcoin.Proto.SigningOutput.decode(compileWithSignatures);
    const result = new SignedTransactionResult(
      this.walletCore.HexCoding.encode(output.encoded).stripHexPrefix(),
      output.transactionId
    );
    return result;
  }
}

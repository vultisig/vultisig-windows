import {
  ITransaction,
  SignatureProps,
  VaultProps,
} from '@clients/extension/src/utils/interfaces'
import { SignedTransactionResult } from '@clients/extension/src/utils/signed-transaction-result'
import BaseTransactionProvider from '@clients/extension/src/utils/transaction-provider/base/index'
import { Chain } from '@core/chain/Chain'

import { TW } from '@trustwallet/wallet-core'
import type {
  CoinType,
  WalletCore,
} from '@trustwallet/wallet-core/dist/src/wallet-core'

interface ChainRef {
  [chainKey: string]: CoinType
}

export default class UTXOTransactionProvider extends BaseTransactionProvider {
  constructor(
    chainKey: Chain,
 
    dataEncoder: (data: Uint8Array) => Promise<string>,
    walletCore: WalletCore
  ) {
    super(chainKey, dataEncoder, walletCore)
  }

  // public getSpecificTransactionInfo = (coin: Coin): Promise<SpecificUtxo> => {
  //   return new Promise<SpecificUtxo>(resolve => {
  //     this.calculateFee(coin).then(async byteFeePrice => {
  //       const specificTransactionInfo: SpecificUtxo = {
  //         gasPrice: byteFeePrice / 10 ** coin.decimals,
  //         fee: byteFeePrice,
  //         byteFee: byteFeePrice,
  //         sendMaxAmount: false,
  //         utxos: await this.getUtxos(coin),
  //       }
  //       resolve(specificTransactionInfo)
  //     })
  //   })
  // }

  // async getPreSignedInputData(): Promise<Uint8Array> {
  //   try {
  //     const input = this.getBitcoinSigningInput()
  //     const inputData = TW.Bitcoin.Proto.SigningInput.encode(input).finish()
  //     const plan = this.walletCore.AnySigner.plan(
  //       inputData,
  //       this.chainRef[this.chainKey]
  //     )
  //     input.plan = TW.Bitcoin.Proto.TransactionPlan.decode(plan)
  //     return TW.Bitcoin.Proto.SigningInput.encode(input).finish()
  //   } catch (err) {
  //     console.log(err)
  //     throw new Error('Failed to get pre-signed input data')
  //   }
  // }

  // private getBitcoinSigningInput = (): TW.Bitcoin.Proto.SigningInput => {
  //   const utxoSpecific = this.keysignPayload!.blockchainSpecific as unknown as {
  //     case: 'utxoSpecific'
  //     value: UTXOSpecific
  //   }
  //   const coinType = this.chainRef[this.chainKey]
  //   const { byteFee, sendMaxAmount } = utxoSpecific.value
  //   const input = TW.Bitcoin.Proto.SigningInput.create({
  //     hashType: this.walletCore.BitcoinScript.hashTypeForCoin(coinType),
  //     amount: Long.fromString(this.keysignPayload!.toAmount),
  //     useMaxAmount: sendMaxAmount,
  //     toAddress: this.keysignPayload!.toAddress,
  //     changeAddress: this.keysignPayload!.coin?.address,
  //     byteFee: Long.fromString(byteFee),
  //     coinType: coinType.value,
  //   })

  //   const encoder = new TextEncoder()
  //   const memo = this.keysignPayload!.memo || ''
  //   if (memo != '') {
  //     input.outputOpReturn = encoder.encode(this.keysignPayload!.memo)
  //   }
  //   for (const utxo of this.keysignPayload!.utxoInfo) {
  //     const lockScript = this.walletCore.BitcoinScript.lockScriptForAddress(
  //       this.keysignPayload!.coin!.address,
  //       coinType
  //     )
  //     switch (coinType) {
  //       case this.walletCore.CoinType.bitcoin:
  //       case this.walletCore.CoinType.litecoin: {
  //         const segWitPubKeyHash = lockScript.matchPayToWitnessPublicKeyHash()
  //         const redeemScript =
  //           this.walletCore.BitcoinScript.buildPayToWitnessPubkeyHash(
  //             segWitPubKeyHash
  //           )
  //         input.scripts[
  //           this.stripHexPrefix(
  //             this.walletCore.HexCoding.encode(segWitPubKeyHash)
  //           )
  //         ] = redeemScript.data()
  //         break
  //       }
  //       case this.walletCore.CoinType.bitcoinCash:
  //       case this.walletCore.CoinType.dash:
  //       case this.walletCore.CoinType.dogecoin: {
  //         const keyHash = lockScript.matchPayToPubkeyHash()
  //         const redeemScriptPubKey =
  //           this.walletCore.BitcoinScript.buildPayToPublicKeyHash(keyHash)

  //         const encoded = this.walletCore.HexCoding.encode(keyHash)

  //         input.scripts[this.stripHexPrefix(encoded)] =
  //           redeemScriptPubKey.data()
  //         break
  //       }
  //       default:
  //         throw new Error('Unsupported coin type')
  //     }
  //     const unspendTransaction = TW.Bitcoin.Proto.UnspentTransaction.create({
  //       amount: Long.fromString(utxo.amount.toString()),
  //       outPoint: TW.Bitcoin.Proto.OutPoint.create({
  //         hash: this.walletCore.HexCoding.decode(utxo.hash).reverse(),
  //         index: utxo.index,
  //         sequence: 0xffffffff,
  //       }),
  //       script: lockScript.data(),
  //     })
  //     input.utxo.push(unspendTransaction)
  //   }
  //   return input
  // }

  // public getSignedTransaction = ({
  //   signature,
  //   inputData,
  //   vault,
  // }: {
  //   transaction: ITransaction
  //   signature: SignatureProps
  //   inputData: Uint8Array
  //   vault: VaultProps
  // }): Promise<{ txHash: string; raw: any }> => {
  //   return new Promise((resolve, reject) => {
  //     const coinType = this.chainRef[this.chainKey]
  //     const allSignatures = this.walletCore.DataVector.create()
  //     const publicKeys = this.walletCore.DataVector.create()
  //     const pubkeyUTXO = vault.chains.find(
  //       chain => chain.chain === this.chainKey
  //     )!.derivationKey!
  //     const publicKeyData = Buffer.from(pubkeyUTXO, 'hex')
  //     const modifiedSig = this.getSignature(signature)
  //     try {
  //       allSignatures.add(modifiedSig)
  //       publicKeys.add(publicKeyData)
  //       const compileWithSignatures =
  //         this.walletCore.TransactionCompiler.compileWithSignatures(
  //           coinType,
  //           inputData,
  //           allSignatures,
  //           publicKeys
  //         )

  //       const output = TW.Bitcoin.Proto.SigningOutput.decode(
  //         compileWithSignatures
  //       )

  //       const result = new SignedTransactionResult(
  //         this.stripHexPrefix(this.walletCore.HexCoding.encode(output.encoded)),
  //         output.transactionId
  //       )
  //       resolve({
  //         txHash: result.transactionHash,
  //         raw: this.stripHexPrefix(
  //           this.walletCore.HexCoding.encode(output.encoded)
  //         ),
  //       })
  //     } catch (err) {
  //       console.log(err)
  //       reject(err)
  //     }
  //   })
  // }

  // private getSignature(signature: SignatureProps): Uint8Array {
  //   return this.walletCore.HexCoding.decode(signature.DerSignature)
  // }

  // private calculateFee(_coin: Coin): Promise<number> {
  //   return new Promise((resolve, reject) => {
  //     api.utxo
  //       .blockchairStats(_coin.chain)
  //       .then((result: any) => {
  //         resolve(result.suggestedTransactionFeePerByteSat)
  //       })
  //       .catch(reject)
  //   })
  // }

  // private async getUtxos(coin: Coin): Promise<SpecificUtxoInfo[]> {
  //   const result = (await api.utxo.blockchairDashboard(
  //     coin.address,
  //     coin.chain
  //   )) as { [key: string]: { utxo: any[] } }
  //   return result[coin.address].utxo.map((utxo: any) => {
  //     return {
  //       hash: utxo.transactionHash,
  //       amount: BigInt(utxo.value),
  //       index: Number(utxo.index),
  //     } as SpecificUtxoInfo
  //   })
  // }
}

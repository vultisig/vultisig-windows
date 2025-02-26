import {
  SignatureProps,
  SignedTransaction,
} from '@clients/extension/src/utils/interfaces'
import { SignedTransactionResult } from '@clients/extension/src/utils/signed-transaction-result'
import BaseTransactionProvider from '@clients/extension/src/utils/transaction-provider/base'
import { Chain } from '@core/chain/Chain'

import { TW, WalletCore } from '@trustwallet/wallet-core'
import { CoinType } from '@trustwallet/wallet-core/dist/src/wallet-core'
import { Buffer } from 'buffer'
import { sha256 } from 'ethers'

export default class MayaTransactionProvider extends BaseTransactionProvider {
  constructor(
    chainKey: Chain,
    chainRef: { [chainKey: string]: CoinType },
    dataEncoder: (data: Uint8Array) => Promise<string>,
    walletCore: WalletCore
  ) {
    super(chainKey, chainRef, dataEncoder, walletCore)
  }

  // public getSpecificTransactionInfo = (
  //   coin: Coin
  // ): Promise<SpecificThorchain> => {
  //   return new Promise<SpecificThorchain>(resolve => {
  //     api.maya.fetchAccountNumber(coin.address).then(accountData => {
  //       this.calculateFee(coin).then(fee => {
  //         const specificThorchain: SpecificThorchain = {
  //           fee,
  //           gasPrice: fee,
  //           accountNumber: Number(accountData?.accountNumber),
  //           sequence: Number(accountData.sequence ?? 0),
  //           isDeposit: false,
  //         } as SpecificThorchain

  //         resolve(specificThorchain)
  //       })
  //     })
  //   })
  // }

  // public getPreSignedInputData = (): Promise<Uint8Array> => {
  //   return new Promise(resolve => {
  //     const mayaSpecific = this.keysignPayload?.blockchainSpecific
  //       .value as unknown as MAYAChainSpecific
  //     let thorchainCoin = TW.Cosmos.Proto.THORChainCoin.create({})
  //     let message: TW.Cosmos.Proto.Message[]
  //     const coinType = this.walletCore.CoinType.thorchain
  //     const pubKeyData = Buffer.from(
  //       this.keysignPayload?.coin?.hexPublicKey ?? '',
  //       'hex'
  //     )
  //     const fromAddr = this.walletCore.AnyAddress.createBech32(
  //       this.keysignPayload?.coin?.address ?? '',
  //       this.walletCore.CoinType.thorchain,
  //       'maya'
  //     )

  //     if (mayaSpecific.isDeposit) {
  //       thorchainCoin = TW.Cosmos.Proto.THORChainCoin.create({
  //         asset: TW.Cosmos.Proto.THORChainAsset.create({
  //           chain: 'MAYA',
  //           symbol: 'CACAO',
  //           ticker: 'CACAO',
  //           synth: false,
  //         }),
  //         decimals: new Long(this.keysignPayload?.coin?.decimals ?? 0),
  //       })
  //       const toAmount = Number(this.keysignPayload?.toAmount ?? '0')

  //       if (toAmount > 0)
  //         thorchainCoin.amount = this.keysignPayload?.toAmount ?? '0'

  //       message = [
  //         TW.Cosmos.Proto.Message.create({
  //           thorchainDepositMessage:
  //             TW.Cosmos.Proto.Message.THORChainDeposit.create({
  //               signer: fromAddr.data(),
  //               memo: this.keysignPayload?.memo ?? '',
  //               coins: [thorchainCoin],
  //             }),
  //         }),
  //       ]
  //     } else {
  //       const toAddress = this.walletCore.AnyAddress.createBech32(
  //         this.keysignPayload?.toAddress ?? '',
  //         coinType,
  //         'maya'
  //       )
  //       if (!toAddress) {
  //         throw new Error('invalid to address')
  //       }
  //       message = [
  //         TW.Cosmos.Proto.Message.create({
  //           thorchainSendMessage: TW.Cosmos.Proto.Message.THORChainSend.create({
  //             fromAddress: fromAddr.data(),
  //             amounts: [
  //               TW.Cosmos.Proto.Amount.create({
  //                 denom: this.keysignPayload?.coin?.ticker.toLowerCase(),
  //                 amount: this.keysignPayload?.toAmount,
  //               }),
  //             ],
  //             toAddress: toAddress.data(),
  //           }),
  //         }),
  //       ]
  //     }

  //     const input = TW.Cosmos.Proto.SigningInput.create({
  //       publicKey: new Uint8Array(pubKeyData),
  //       signingMode: SigningMode.Protobuf,
  //       chainId: 'mayachain-mainnet-v1',
  //       accountNumber: new Long(Number(mayaSpecific.accountNumber)),
  //       sequence: new Long(Number(mayaSpecific.sequence)),
  //       mode: BroadcastMode.SYNC,
  //       memo: this.keysignPayload?.memo ?? '',
  //       messages: message,
  //       fee: TW.Cosmos.Proto.Fee.create({
  //         gas: new Long(2000000000),
  //       }),
  //     })
  //     resolve(TW.Cosmos.Proto.SigningInput.encode(input).finish())
  //   })
  // }

  public getSignedTransaction = ({
    inputData,
    signature,
    vault,
  }: SignedTransaction): Promise<{ txHash: string; raw: any }> => {
    return new Promise((resolve, reject) => {
      if (inputData && vault) {
        const pubkeyMaya = vault.chains.find(
          chain => chain.chain === Chain.MayaChain
        )?.derivationKey

        if (pubkeyMaya) {
          const coinType = this.walletCore.CoinType.thorchain
          const allSignatures = this.walletCore.DataVector.create()
          const publicKeys = this.walletCore.DataVector.create()
          const publicKeyData = Buffer.from(pubkeyMaya, 'hex')
          const modifiedSig = this.getSignature(signature)

          allSignatures.add(modifiedSig)
          publicKeys.add(publicKeyData)

          const compileWithSignatures =
            this.walletCore.TransactionCompiler.compileWithSignatures(
              coinType,
              inputData,
              allSignatures,
              publicKeys
            )
          const output = TW.Cosmos.Proto.SigningOutput.decode(
            compileWithSignatures
          )
          const serializedData = output.serialized
          const parsedData = JSON.parse(serializedData)
          const txBytes = parsedData.tx_bytes
          const decodedTxBytes = Buffer.from(txBytes, 'base64')
          const hash = sha256(decodedTxBytes)
          const result = new SignedTransactionResult(
            serializedData,
            hash,
            undefined
          )

          resolve({ txHash: result.transactionHash, raw: serializedData })
        } else {
          reject()
        }
      } else {
        reject()
      }
    })
  }

  private getSignature(signature: SignatureProps): Uint8Array {
    const rData = this.walletCore.HexCoding.decode(signature.R)
    const sData = this.walletCore.HexCoding.decode(signature.S)
    const recoveryIDdata = this.walletCore.HexCoding.decode(
      signature.RecoveryID
    )
    const combinedData = new Uint8Array(
      rData.length + sData.length + recoveryIDdata.length
    )
    combinedData.set(rData)
    combinedData.set(sData, rData.length)
    combinedData.set(recoveryIDdata, rData.length + sData.length)
    return combinedData
  }

  // private async calculateFee(_coin?: Coin): Promise<number> {
  //   return 2000000000
  // }
}

import { create } from '@bufbuild/protobuf'
import type {
  ITransaction,
  SignatureProps,
  SignedTransaction,
  VaultProps,
} from '@clients/extension/src/utils/interfaces'
import { SignedTransactionResult } from '@clients/extension/src/utils/signed-transaction-result'
import BaseTransactionProvider from '@clients/extension/src/utils/transaction-provider/base'
import { Chain } from '@core/chain/Chain'
import { getTronBlockInfo } from '@core/chain/chains/tron/getTronBlockInfo'
import {
  TronSpecific,
  TronSpecificSchema,
} from '@core/communication/vultisig/keysign/v1/blockchain_specific_pb'
import {
  Coin,
  CoinSchema,
} from '@core/communication/vultisig/keysign/v1/coin_pb'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@core/communication/vultisig/keysign/v1/keysign_message_pb'
import { TW, WalletCore } from '@trustwallet/wallet-core'
import { CoinType } from '@trustwallet/wallet-core/dist/src/wallet-core'
import { Buffer } from 'buffer'
import { sha256 } from 'ethers'
import Long from 'long'

export default class TronTransactionProvider extends BaseTransactionProvider {
  constructor(
    chainKey: Chain,
    chainRef: { [chainKey: string]: CoinType },
    dataEncoder: (data: Uint8Array) => Promise<string>,
    walletCore: WalletCore
  ) {
    super(chainKey, chainRef, dataEncoder, walletCore)
  }

  public getSpecificTransactionInfo = async (
    coin: Coin
  ): Promise<TronSpecific> => {
    try {
      const blockInfo = await getTronBlockInfo(coin)

      return create(TronSpecificSchema, {
        timestamp: BigInt(blockInfo.timestamp),
        expiration: BigInt(blockInfo.expiration),
        blockHeaderTimestamp: BigInt(blockInfo.blockHeaderTimestamp),
        blockHeaderNumber: BigInt(blockInfo.blockHeaderNumber),
        blockHeaderVersion: BigInt(blockInfo.blockHeaderVersion),
        blockHeaderTxTrieRoot: blockInfo.blockHeaderTxTrieRoot,
        blockHeaderParentHash: blockInfo.blockHeaderParentHash,
        blockHeaderWitnessAddress: blockInfo.blockHeaderWitnessAddress,
        gasEstimation: BigInt(blockInfo.gasFeeEstimation),
      })
    } catch (error) {
      console.error('Error fetching Tron block info:', error)
      throw error
    }
  }

  public getKeysignPayload = (
    transaction: ITransaction,
    vault: VaultProps
  ): Promise<KeysignPayload> => {
    return new Promise(resolve => {
      const coin = create(CoinSchema, {
        chain: transaction.chain.chain,
        ticker: transaction.chain.ticker,
        address: transaction.transactionDetails.from,
        decimals: transaction.chain.decimals,
        hexPublicKey: vault.chains.find(
          chain => chain.chain === transaction.chain.chain
        )?.derivationKey,
        isNativeToken: true,
        logo: transaction.chain.ticker.toLowerCase(),
      })

      this.getSpecificTransactionInfo(coin).then(blockInfo => {
        const tronSpecific = create(TronSpecificSchema, {
          timestamp: BigInt(blockInfo.timestamp),
          expiration: BigInt(blockInfo.expiration),
          blockHeaderTimestamp: BigInt(blockInfo.blockHeaderTimestamp),
          blockHeaderNumber: BigInt(blockInfo.blockHeaderNumber),
          blockHeaderVersion: BigInt(blockInfo.blockHeaderVersion),
          blockHeaderTxTrieRoot: blockInfo.blockHeaderTxTrieRoot,
          blockHeaderParentHash: blockInfo.blockHeaderParentHash,
          blockHeaderWitnessAddress: blockInfo.blockHeaderWitnessAddress,
          gasEstimation: BigInt(blockInfo.gasEstimation),
        })

        const keysignPayload = create(KeysignPayloadSchema, {
          toAddress: transaction.transactionDetails.to,
          toAmount: transaction.transactionDetails.amount?.amount
            ? BigInt(
                parseInt(transaction.transactionDetails.amount.amount)
              ).toString()
            : '0',
          memo: transaction.transactionDetails.data,
          vaultPublicKeyEcdsa: vault.publicKeyEcdsa,
          vaultLocalPartyId: 'VultiConnect',
          coin,
          blockchainSpecific: {
            case: 'tronSpecific',
            value: tronSpecific,
          },
        })

        this.keysignPayload = keysignPayload

        resolve(keysignPayload)
      })
    })
  }

  public getPreSignedInputData = (): Promise<Uint8Array> => {
    return new Promise(resolve => {
      const tronSpecific = this.keysignPayload?.blockchainSpecific
        .value as unknown as TronSpecific

      const isNative = this.keysignPayload?.coin?.isNativeToken

      if (isNative) {
        const contract = TW.Tron.Proto.TransferContract.create({
          ownerAddress: this.keysignPayload?.coin?.address ?? '',
          toAddress: this.keysignPayload?.toAddress,
          amount: Long.fromString(this.keysignPayload?.toAmount ?? '0'),
        })

        const input = TW.Tron.Proto.SigningInput.create({
          transaction: TW.Tron.Proto.Transaction.create({
            transfer: contract,
            timestamp: Long.fromString(tronSpecific.timestamp.toString()),
            blockHeader: TW.Tron.Proto.BlockHeader.create({
              timestamp: Long.fromString(
                tronSpecific.blockHeaderTimestamp.toString()
              ),
              number: Long.fromString(
                tronSpecific.blockHeaderNumber.toString()
              ),
              version: Number(tronSpecific.blockHeaderVersion.toString()),
              txTrieRoot: Buffer.from(
                tronSpecific.blockHeaderTxTrieRoot,
                'hex'
              ),
              parentHash: Buffer.from(
                tronSpecific.blockHeaderParentHash,
                'hex'
              ),
              witnessAddress: Buffer.from(
                tronSpecific.blockHeaderWitnessAddress,
                'hex'
              ),
            }),
            expiration: Long.fromString(tronSpecific.expiration.toString()),
          }),
        })

        resolve(TW.Tron.Proto.SigningInput.encode(input).finish())
      }
    })
  }

  public getSignedTransaction = ({
    inputData,
    signature,
    vault,
  }: SignedTransaction): Promise<{ txHash: string; raw: any }> => {
    return new Promise((resolve, reject) => {
      if (inputData && vault) {
        const pubkey = vault.chains.find(
          chain => chain.chain === Chain.Tron
        )?.derivationKey

        if (pubkey) {
          const coinType = this.walletCore.CoinType.tron
          const allSignatures = this.walletCore.DataVector.create()
          const publicKeys = this.walletCore.DataVector.create()
          const publicKeyData = Buffer.from(pubkey, 'hex')
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
          const output = TW.Tron.Proto.SigningOutput.decode(
            compileWithSignatures
          )
          const serializedData = output.json
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
}

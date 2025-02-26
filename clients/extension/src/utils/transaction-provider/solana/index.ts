/* 

DEPRECATED! This file is no longer used in the project.
It was replaced by the file on CORE

@rcoderdev @johnnyluo please deprecate all files you are moving to core. 

*/

import { create } from '@bufbuild/protobuf'
import type {
  ITransaction,
  SignatureProps,
  SignedTransaction,
  SpecificSolana,
  VaultProps,
} from '@clients/extension/src/utils/interfaces'
import { SignedTransactionResult } from '@clients/extension/src/utils/signed-transaction-result'
import BaseTransactionProvider from '@clients/extension/src/utils/transaction-provider/base'
import { Chain } from '@core/chain/Chain'
import { getSolanaClient } from '@core/chain/chains/solana/client'
import {
  SolanaSpecific,
  SolanaSpecificSchema,
} from '@core/communication/vultisig/keysign/v1/blockchain_specific_pb'
import {
  Coin,
  CoinSchema,
} from '@core/communication/vultisig/keysign/v1/coin_pb'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@core/communication/vultisig/keysign/v1/keysign_message_pb'
import { fromLegacyPublicKey } from '@solana/compat'
import { PublicKey } from '@solana/web3.js'
import { TW } from '@trustwallet/wallet-core'
import { Buffer } from 'buffer'
import { formatUnits } from 'ethers'
import Long from 'long'
export default class SolanaTransactionProvider extends BaseTransactionProvider {
  async fetchHighPriorityFee(address: string): Promise<number> {
    const client = getSolanaClient()
    const prioritizationFees = await client
      .getRecentPrioritizationFees([
        fromLegacyPublicKey(new PublicKey(address)),
      ])
      .send()
    return Math.max(
      ...prioritizationFees.map(fee => Number(fee.prioritizationFee.valueOf())),
      0
    )
  }

  async fetchRecentBlockhash(): Promise<string> {
    const client = getSolanaClient()
    const response = await client
      .getLatestBlockhash({ commitment: 'confirmed' })
      .send()
    return response?.value.blockhash as string
  }

  public async getSpecificTransactionInfo(coin: Coin): Promise<SpecificSolana> {
    try {
      const [recentBlockHash, highPriorityFee] = await Promise.all([
        this.fetchRecentBlockhash(),
        this.fetchHighPriorityFee(coin.address),
      ])

      if (!recentBlockHash) {
        throw new Error('Failed to get recent block hash')
      }

      return {
        recentBlockHash,
        priorityFee: highPriorityFee,
        gasPrice: Number(formatUnits(1_000_000, 9)),
      } as SpecificSolana
    } catch (error) {
      throw new Error(`Error fetching gas info: ${(error as any).message}`)
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
        logo: transaction.chain.chain.toLowerCase(),
        priceProviderId: 'solana',
      })
      this.getSpecificTransactionInfo(coin).then(specificData => {
        const solanaSpecific = create(SolanaSpecificSchema, {
          $typeName: 'vultisig.keysign.v1.SolanaSpecific',
          recentBlockHash: specificData.recentBlockHash,
          priorityFee: specificData.priorityFee.toString(),
        })

        const keysignPayload = create(KeysignPayloadSchema, {
          toAddress: transaction.transactionDetails.to,
          toAmount: transaction.transactionDetails.amount?.amount
            ? BigInt(
                parseInt(transaction.transactionDetails.amount.amount)
              ).toString()
            : '0',
          vaultPublicKeyEcdsa: vault.publicKeyEcdsa,
          vaultLocalPartyId: 'VultiConnect',
          coin,
          blockchainSpecific: {
            case: 'solanaSpecific',
            value: solanaSpecific,
          },
          memo: '',
        })

        this.keysignPayload = keysignPayload
        resolve(keysignPayload)
      })
    })
  }

  public getPreSignedInputData = (): Promise<Uint8Array> => {
    return new Promise(resolve => {
      const solanaSpecific = this.keysignPayload?.blockchainSpecific
        .value as unknown as SolanaSpecific
      const {
        recentBlockHash,
        fromTokenAssociatedAddress,
        toTokenAssociatedAddress,
        programId,
      } = solanaSpecific

      const priorityFeePrice = 1_000_000
      const priorityFeeLimit = Number(100_000)
      const newRecentBlockHash = recentBlockHash
      if (!this.keysignPayload || !this.keysignPayload.coin) {
        throw new Error('keysignPayload is missing')
      }

      if (this.keysignPayload.coin.isNativeToken) {
        // Native token transfer
        const input = TW.Solana.Proto.SigningInput.create({
          transferTransaction: TW.Solana.Proto.Transfer.create({
            recipient: this.keysignPayload.toAddress,
            value: Long.fromString(this.keysignPayload.toAmount),
            memo: this.keysignPayload.memo,
          }),
          recentBlockhash: newRecentBlockHash,
          sender: this.keysignPayload.coin.address,
          priorityFeePrice: TW.Solana.Proto.PriorityFeePrice.create({
            price: Long.fromString(priorityFeePrice.toString()),
          }),
          priorityFeeLimit: TW.Solana.Proto.PriorityFeeLimit.create({
            limit: priorityFeeLimit,
          }),
        })

        // Encode the input
        const encodedInput = TW.Solana.Proto.SigningInput.encode(input).finish()

        return resolve(encodedInput)
      } else {
        // Token transfer
        if (fromTokenAssociatedAddress && toTokenAssociatedAddress) {
          // Both addresses are available for token transfer
          const tokenTransferMessage = TW.Solana.Proto.TokenTransfer.create({
            tokenMintAddress: this.keysignPayload.coin.contractAddress,
            senderTokenAddress: fromTokenAssociatedAddress,
            recipientTokenAddress: toTokenAssociatedAddress,
            amount: Long.fromString(this.keysignPayload.toAmount),
            decimals: this.keysignPayload.coin.decimals,
            tokenProgramId: programId
              ? TW.Solana.Proto.TokenProgramId.Token2022Program
              : TW.Solana.Proto.TokenProgramId.TokenProgram,
          })
          const input = TW.Solana.Proto.SigningInput.create({
            tokenTransferTransaction: tokenTransferMessage,
            recentBlockhash: newRecentBlockHash,
            sender: this.keysignPayload.coin.address,
            priorityFeePrice: TW.Solana.Proto.PriorityFeePrice.create({
              price: Long.fromString(priorityFeePrice.toString()),
            }),
            priorityFeeLimit: TW.Solana.Proto.PriorityFeeLimit.create({
              limit: priorityFeeLimit,
            }),
          })
          resolve(TW.Solana.Proto.SigningInput.encode(input).finish())
        } else if (fromTokenAssociatedAddress && !toTokenAssociatedAddress) {
          // Generate the associated address if `toTokenAssociatedAddress` is missing
          const receiverAddress =
            this.walletCore.SolanaAddress.createWithString(
              this.keysignPayload.toAddress
            )
          const generatedAssociatedAddress =
            receiverAddress.defaultTokenAddress(
              this.keysignPayload.coin.contractAddress
            )
          if (!generatedAssociatedAddress) {
            throw new Error(
              'We must have the association between the minted token and the TO address'
            )
          }
          const createAndTransferTokenMessage =
            TW.Solana.Proto.CreateAndTransferToken.create({
              recipientMainAddress: this.keysignPayload.toAddress,
              tokenMintAddress: this.keysignPayload.coin.contractAddress,
              recipientTokenAddress: generatedAssociatedAddress,
              senderTokenAddress: fromTokenAssociatedAddress,
              amount: Long.fromString(this.keysignPayload.toAmount),
              decimals: this.keysignPayload.coin.decimals,
              tokenProgramId: programId
                ? TW.Solana.Proto.TokenProgramId.Token2022Program
                : TW.Solana.Proto.TokenProgramId.TokenProgram,
            })
          const input = TW.Solana.Proto.SigningInput.create({
            createAndTransferTokenTransaction: createAndTransferTokenMessage,
            recentBlockhash: newRecentBlockHash,
            sender: this.keysignPayload.coin.address,
            priorityFeePrice: TW.Solana.Proto.PriorityFeePrice.create({
              price: Long.fromString(priorityFeePrice.toString()),
            }),
            priorityFeeLimit: TW.Solana.Proto.PriorityFeeLimit.create({
              limit: priorityFeeLimit,
            }),
          })
          resolve(TW.Solana.Proto.SigningInput.encode(input).finish())
        } else {
          throw new Error(
            'To send tokens we must have the association between the minted token and the TO address'
          )
        }
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
        try {
          const coinType = this.walletCore.CoinType.solana
          const pubkeySolana = vault.chains.find(
            chain => chain.chain === Chain.Solana
          )?.derivationKey
          const allSignatures = this.walletCore.DataVector.create()
          const publicKeys = this.walletCore.DataVector.create()
          const pubkey = this.walletCore.PublicKey.createWithData(
            Buffer.from(pubkeySolana!, 'hex'),
            this.walletCore.PublicKeyType.ed25519
          )
          const modifiedSig = this.getSignature(signature)
          allSignatures.add(modifiedSig)
          publicKeys.add(pubkey.data())
          const compileWithSignatures =
            this.walletCore.TransactionCompiler.compileWithSignatures(
              coinType,
              inputData,
              allSignatures,
              publicKeys
            )
          const {
            encoded,
            signatures,
            errorMessage: solanaErrorMessage,
          } = TW.Solana.Proto.SigningOutput.decode(compileWithSignatures)
          if (solanaErrorMessage) {
            reject(solanaErrorMessage)
          } else {
            const result = new SignedTransactionResult(
              encoded,
              signatures[0].signature!,
              undefined
            )
            resolve({ txHash: result.transactionHash, raw: encoded })
          }
        } catch (err) {
          console.error('Error generating signed transaction:', err)
          reject(err)
        }
      } else {
        reject(new Error('Public key for Solana not found'))
      }
    })
  }

  private getSignature(signature: SignatureProps): Uint8Array {
    const rData = this.walletCore.HexCoding.decode(signature.R).reverse()
    const sData = this.walletCore.HexCoding.decode(signature.S).reverse()
    const combinedData = new Uint8Array(rData.length + sData.length)
    combinedData.set(rData)
    combinedData.set(sData, rData.length)
    return combinedData
  }
}

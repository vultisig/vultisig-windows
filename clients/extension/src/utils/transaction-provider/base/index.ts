import { create, toBinary } from '@bufbuild/protobuf'
import {
  ITransaction,
  SignatureProps,
  SignedTransaction,
  VaultProps,
} from '@clients/extension/src/utils/interfaces'
import { Chain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { getCoinFromCoinKey } from '@core/chain/coin/Coin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { CoinSchema } from '@core/communication/vultisig/keysign/v1/coin_pb'
import { CustomMessagePayload } from '@core/communication/vultisig/keysign/v1/custom_message_payload_pb'
import {
  KeysignMessage,
  KeysignMessageSchema,
  KeysignPayload,
  KeysignPayloadSchema,
} from '@core/communication/vultisig/keysign/v1/keysign_message_pb'
import { getChainSpecific } from '@core/keysign/chainSpecific'
import { TW, WalletCore } from '@trustwallet/wallet-core'
import { CoinType } from '@trustwallet/wallet-core/dist/src/wallet-core'
import { randomBytes, toUtf8String } from 'ethers'

import { checkERC20Function } from '../../functions'
interface ChainRef {
  [chainKey: string]: CoinType
}

export default abstract class BaseTransactionProvider {
  protected chainKey: Chain
  protected chainRef: ChainRef
  protected dataEncoder: (data: Uint8Array) => Promise<string>
  protected walletCore: WalletCore
  protected keysignPayload?: KeysignPayload

  constructor(
    chainKey: Chain,
    chainRef: ChainRef,
    dataEncoder: (data: Uint8Array) => Promise<string>,
    walletCore: WalletCore
  ) {
    this.chainKey = chainKey
    this.chainRef = chainRef
    this.dataEncoder = dataEncoder
    this.walletCore = walletCore
  }

  protected encryptionKeyHex = (): string => {
    const keyBytes = randomBytes(32)

    return Array.from(keyBytes)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('')
  }

  protected stripHexPrefix = (hex: string): string => {
    return hex.startsWith('0x') ? hex.slice(2) : hex
  }

  protected ensureHexPrefix = (hex: string): string => {
    return hex.startsWith('0x') ? hex : '0x' + hex
  }

  protected ensurePriorityFeeValue = (
    priorityFee: bigint,
    chainKey: Chain
  ): bigint => {
    switch (chainKey) {
      case Chain.Avalanche:
      case Chain.Ethereum: {
        const oneGwei = 1000000000n
        return priorityFee < oneGwei ? oneGwei : priorityFee
      }
      default:
        return priorityFee
    }
  }

  public getPreSignedImageHash = (
    preSignedInputData: Uint8Array
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const preHashes = this.walletCore.TransactionCompiler.preImageHashes(
        this.chainRef[this.chainKey],
        preSignedInputData
      )

      const preSigningOutput =
        TW.TxCompiler.Proto.PreSigningOutput.decode(preHashes)

      if (preSigningOutput.errorMessage !== '')
        reject(preSigningOutput.errorMessage)

      const imageHash = this.walletCore.HexCoding.encode(
        preSigningOutput.dataHash
      )?.replace(/^0x/, '')

      resolve(imageHash)
    })
  }

  public getTransactionKey = (
    publicKeyEcdsa: string,
    transaction: ITransaction,
    hexChainCode: string
  ): Promise<string> => {
    return new Promise(resolve => {
      const messsage: KeysignMessage = {
        $typeName: 'vultisig.keysign.v1.KeysignMessage',
        sessionId: transaction.id,
        serviceName: 'VultiConnect',
        encryptionKeyHex: hexChainCode,
        useVultisigRelay: true,
        payloadId: '',
      }
      if (transaction.isCustomMessage) {
        messsage.customMessagePayload = {
          $typeName: 'vultisig.keysign.v1.CustomMessagePayload',
          method: transaction.customMessage?.method,
          message: transaction.customMessage!.message,
        } as CustomMessagePayload
      } else {
        messsage.keysignPayload = this.keysignPayload
      }

      const binary = toBinary(KeysignMessageSchema, messsage)

      this.dataEncoder(binary).then(base64EncodedData => {
        resolve(
          `vultisig://vultisig.com?type=SignTransaction&vault=${publicKeyEcdsa}&jsonData=${base64EncodedData}`
        )
      })
    })
  }

  abstract getPreSignedInputData(): Promise<Uint8Array>

  public getDerivePath = (chain: string) => {
    const coin = this.chainRef[chain]
    return this.walletCore.CoinTypeExt.derivationPath(coin)
  }

  abstract getSignedTransaction({
    inputData,
    signature,
    transaction,
    vault,
  }: SignedTransaction): Promise<{ txHash: string; raw: any }>

  public getKeysignPayload(
    transaction: ITransaction,
    vault: VaultProps
  ): Promise<KeysignPayload> {
    return new Promise(resolve => {
      const localCoin = getCoinFromCoinKey({
        chain: transaction.chain.chain,
        id: transaction.transactionDetails.asset.ticker,
      })

      const accountCoin = {
        ...localCoin,
        address: transaction.transactionDetails.from,
      } as AccountCoin

      getChainSpecific({
        coin: accountCoin,
        amount: Number(transaction.transactionDetails.amount?.amount),
        isDeposit: transaction.isDeposit,
        receiver: transaction.transactionDetails.to,
      }).then(chainSpecific => {
        const coin = create(CoinSchema, {
          chain: transaction.chain.chain,
          ticker: accountCoin.ticker,
          address: transaction.transactionDetails.from,
          decimals: accountCoin.decimals,
          hexPublicKey: vault.chains.find(
            chain => chain.chain === transaction.chain.chain
          )?.derivationKey,
          isNativeToken: isFeeCoin(accountCoin),
          logo: accountCoin.logo,
          priceProviderId: localCoin?.priceProviderId ?? '',
        })
        let modifiedMemo = null
        if (getChainKind(transaction.chain.chain) === 'evm') {
          checkERC20Function(transaction.transactionDetails.data!).then(
            isMemoFunction => {
              try {
                modifiedMemo =
                  isMemoFunction || transaction.transactionDetails.data === '0x'
                    ? (transaction.transactionDetails.data ?? '')
                    : toUtf8String(transaction.transactionDetails.data!)
              } catch {
                modifiedMemo = transaction.transactionDetails.data!
              }
            }
          )
        }
        const keysignPayload = create(KeysignPayloadSchema, {
          toAddress: transaction.transactionDetails.to,
          toAmount: transaction.transactionDetails.amount?.amount
            ? BigInt(
                parseInt(String(transaction.transactionDetails.amount.amount))
              ).toString()
            : '0',
          memo: modifiedMemo ?? transaction.transactionDetails.data,
          vaultPublicKeyEcdsa: vault.publicKeyEcdsa,
          vaultLocalPartyId: 'VultiConnect',
          coin,
          blockchainSpecific: chainSpecific,
        })
        console.log('payload:', keysignPayload)

        this.keysignPayload = keysignPayload
        resolve(keysignPayload)
      })
    })
  }

  protected encodeData(data: Uint8Array): Promise<string> {
    return this.dataEncoder(data)
  }
  public getCustomMessageSignature(signature: SignatureProps): Uint8Array {
    const rData = this.walletCore.HexCoding.decode(signature.R)
    const sData = this.walletCore.HexCoding.decode(signature.S)
    const vByte = parseInt(signature.RecoveryID, 16) // Convert hex string to integer
    const vData = new Uint8Array([vByte]) // Convert integer to Uint8Array

    const combinedData = new Uint8Array(rData.length + sData.length + 1)
    combinedData.set(rData)
    combinedData.set(sData, rData.length)
    combinedData.set(vData, rData.length + sData.length) // Attach `v` at the end
    return combinedData
  }

  public getEncodedSignature(signature: SignatureProps): string {
    return this.ensureHexPrefix(
      this.walletCore.HexCoding.encode(
        this.getCustomMessageSignature(signature)
      )
    )
  }
}

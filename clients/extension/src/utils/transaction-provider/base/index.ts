import { toBinary } from '@bufbuild/protobuf'
import {
  ITransaction,
  SignatureProps,
  SignedTransaction,
  VaultProps,
} from '@clients/extension/src/utils/interfaces'
import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { chainTokens } from '@core/chain/coin/chainTokens'
import { CustomMessagePayload } from '@core/communication/vultisig/keysign/v1/custom_message_payload_pb'
import {
  KeysignMessage,
  KeysignMessageSchema,
  KeysignPayload,
} from '@core/communication/vultisig/keysign/v1/keysign_message_pb'
import { TW, WalletCore } from '@trustwallet/wallet-core'
import { CoinType } from '@trustwallet/wallet-core/dist/src/wallet-core'
import { randomBytes } from 'ethers'

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
      const message: KeysignMessage = {
        $typeName: 'vultisig.keysign.v1.KeysignMessage',
        sessionId: transaction.id,
        serviceName: 'VultiConnect',
        encryptionKeyHex: hexChainCode,
        useVultisigRelay: true,
        payloadId: '',
      }
      if (transaction.isCustomMessage) {
        message.customMessagePayload = {
          $typeName: 'vultisig.keysign.v1.CustomMessagePayload',
          method: transaction.customMessage?.method,
          message: transaction.customMessage!.message,
        } as CustomMessagePayload
      } else {
        let priceProviderId: string | undefined

        if (this.keysignPayload?.coin) {
          const { chain, isNativeToken, ticker } = this.keysignPayload.coin

          priceProviderId = isNativeToken
            ? chainFeeCoin[chain as Chain]?.priceProviderId
            : chainTokens[chain as Chain]?.find(
                token => token.ticker === ticker
              )?.priceProviderId
        }

        if (priceProviderId) {
          message.keysignPayload = {
            ...this.keysignPayload,
            coin: {
              ...this.keysignPayload?.coin,
              priceProviderId,
            } as KeysignPayload['coin'],
          } as KeysignPayload
        } else {
          message.keysignPayload = this.keysignPayload
        }
      }

      const binary = toBinary(KeysignMessageSchema, message)

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

  abstract getKeysignPayload(
    transaction: ITransaction,
    vault: VaultProps
  ): Promise<KeysignPayload>

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

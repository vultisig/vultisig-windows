import api from '@clients/extension/src/utils/api'
import { Currency } from '@clients/extension/src/utils/constants'
import { bigintToByteArray } from '@clients/extension/src/utils/functions'
import { SignedTransaction } from '@clients/extension/src/utils/interfaces'
import BaseTransactionProvider from '@clients/extension/src/utils/transaction-provider/base'
import { EvmChain } from '@core/chain/Chain'
import { getEvmClient } from '@core/chain/chains/evm/client'
import { EthereumSpecific } from '@core/communication/vultisig/keysign/v1/blockchain_specific_pb'
import { TW, WalletCore } from '@trustwallet/wallet-core'
import { CoinType } from '@trustwallet/wallet-core/dist/src/wallet-core'
import { Buffer } from 'buffer'
import { formatUnits, keccak256, Transaction } from 'ethers'
import { PublicClient } from 'viem'
interface ChainRef {
  [chainKey: string]: CoinType
}

export default class EVMTransactionProvider extends BaseTransactionProvider {
  private gasPrice?: bigint
  private maxPriorityFeePerGas?: bigint
  private nonce?: bigint

  private provider: PublicClient

  constructor(
    chainKey: EvmChain,
    chainRef: ChainRef,
    dataEncoder: (data: Uint8Array) => Promise<string>,
    walletCore: WalletCore
  ) {
    super(chainKey, chainRef, dataEncoder, walletCore)
    this.provider = getEvmClient(this.chainKey as EvmChain)
  }

  public getEstimateTransactionFee = (
    cmcId: number,
    currency: Currency
  ): Promise<string> => {
    return new Promise(resolve => {
      api
        .cryptoCurrency(cmcId, currency)
        .then(price => {
          const gwei = formatUnits(
            ((this.gasPrice ?? BigInt(0)) +
              (this.maxPriorityFeePerGas ?? BigInt(0))) *
              BigInt(this.getGasLimit()),
            'gwei'
          )

          resolve((parseInt(gwei) * 1e-9 * price).toValueFormat(currency))
        })
        .catch(() => {
          resolve((0).toValueFormat(currency))
        })
    })
  }

  public getFeeData = async () => {
    try {
      const [gasPrice, maxPriorityFeePerGas] = await Promise.all([
        this.provider.getGasPrice(),
        this.provider.estimateMaxPriorityFeePerGas(),
      ])
      this.gasPrice = gasPrice ?? BigInt(0)
      this.maxPriorityFeePerGas = maxPriorityFeePerGas ?? BigInt(0)
    } catch {
      this.gasPrice = BigInt(0)
      this.maxPriorityFeePerGas = BigInt(0)
    }
  }

  public getGasLimit = (): number => {
    return 600000
  }

  public getPreSignedInputData = (): Promise<Uint8Array> => {
    return new Promise((resolve, reject) => {
      if (!this.keysignPayload) {
        reject('Invalid keysign payload')
        return
      }
      const blockchainSpecific = this.keysignPayload.blockchainSpecific as
        | { case: 'ethereumSpecific'; value: EthereumSpecific }
        | undefined

      if (
        !blockchainSpecific ||
        blockchainSpecific.case !== 'ethereumSpecific'
      ) {
        reject('Invalid blockchain specific')
      } else if (!this.keysignPayload?.coin) {
        reject('Invalid coin')
      }

      if (!blockchainSpecific) {
        reject('Invalid blockchain specific')
        return
      }

      const { gasLimit, maxFeePerGasWei, nonce, priorityFee } =
        blockchainSpecific.value

      const chainId: bigint = BigInt(
        this.walletCore.CoinTypeExt.chainId(this.chainRef[this.chainKey])
      )

      const chainIdHex = bigintToByteArray(BigInt(chainId))

      const nonceHex = bigintToByteArray(BigInt(nonce))

      const gasLimitHex = bigintToByteArray(BigInt(gasLimit))

      const maxFeePerGasHex = bigintToByteArray(BigInt(maxFeePerGasWei))

      const maxInclusionFeePerGasHex = bigintToByteArray(BigInt(priorityFee))

      const amountHex = bigintToByteArray(BigInt(this.keysignPayload.toAmount))
      let toAddress = this.keysignPayload.toAddress
      let evmTransaction = TW.Ethereum.Proto.Transaction.create({
        transfer: TW.Ethereum.Proto.Transaction.Transfer.create({
          amount: amountHex,
          data: Buffer.from(
            this.keysignPayload.memo
              ? this.stripHexPrefix(this.keysignPayload.memo)
              : '',
            'utf8'
          ),
        }),
      })
      if (
        this.keysignPayload?.coin &&
        !this.keysignPayload.coin.isNativeToken
      ) {
        toAddress = this.keysignPayload.coin.contractAddress
        evmTransaction = TW.Ethereum.Proto.Transaction.create({
          erc20Transfer: TW.Ethereum.Proto.Transaction.ERC20Transfer.create({
            amount: amountHex,
            to: this.keysignPayload.toAddress,
          }),
        })
      }
      const input = TW.Ethereum.Proto.SigningInput.create({
        toAddress: toAddress,
        chainId: chainIdHex,
        nonce: nonceHex,
        gasLimit: gasLimitHex,
        maxFeePerGas: maxFeePerGasHex,
        maxInclusionFeePerGas: maxInclusionFeePerGasHex,
        txMode: TW.Ethereum.Proto.TransactionMode.Enveloped,
        transaction: evmTransaction,
      })

      resolve(TW.Ethereum.Proto.SigningInput.encode(input).finish())
    })
  }

  public getSignedTransaction = ({
    signature,
    transaction,
  }: SignedTransaction): Promise<{ txHash: string; raw: any }> => {
    return new Promise((resolve, reject) => {
      if (transaction) {
        const props = {
          chainId: parseInt(transaction.chain.id).toString(),
          nonce: Number(this.nonce),
          gasLimit: this.getGasLimit().toString(),
          maxFeePerGas: ((this.gasPrice ?? BigInt(0)) * BigInt(5)) / BigInt(2),
          maxPriorityFeePerGas: this.ensurePriorityFeeValue(
            !this.maxPriorityFeePerGas || this.maxPriorityFeePerGas === 0n
              ? this.gasPrice!
              : this.maxPriorityFeePerGas,
            this.chainKey
          ).toString(),
          to: transaction.transactionDetails.to,
          value: transaction.transactionDetails.amount?.amount
            ? BigInt(transaction.transactionDetails.amount.amount)
            : BigInt(0),
          signature: {
            v: BigInt(signature.RecoveryID),
            r: `0x${signature.R}`,
            s: `0x${signature.S}`,
          },
        }

        const tx = transaction.transactionDetails.data
          ? { ...props, data: transaction.transactionDetails.data }
          : props

        const txHash = keccak256(Transaction.from(tx).serialized)

        resolve({ txHash: txHash, raw: Transaction.from(tx).serialized })
      } else {
        reject()
      }
    })
  }
}

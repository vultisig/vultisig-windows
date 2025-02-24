import { create } from '@bufbuild/protobuf'
import api from '@clients/extension/src/utils/api'
import {
  CosmosAccountData,
  ITransaction,
  SignatureProps,
  SignedTransaction,
  SpecificCosmos,
  VaultProps,
} from '@clients/extension/src/utils/interfaces'
import { SignedTransactionResult } from '@clients/extension/src/utils/signed-transaction-result'
import BaseTransactionProvider from '@clients/extension/src/utils/transaction-provider/base'
import { Chain } from '@core/chain/Chain'
import {
  CosmosSpecific,
  CosmosSpecificSchema,
  TransactionType,
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
import { formatUnits, sha256 } from 'ethers'
import Long from 'long'
import SigningMode = TW.Cosmos.Proto.SigningMode
import BroadcastMode = TW.Cosmos.Proto.BroadcastMode

export default class CosmosTransactionProvider extends BaseTransactionProvider {
  constructor(
    chainKey: Chain,
    chainRef: { [chainKey: string]: CoinType },
    dataEncoder: (data: Uint8Array) => Promise<string>,
    walletCore: WalletCore
  ) {
    super(chainKey, chainRef, dataEncoder, walletCore)
  }

  public getSpecificTransactionInfo = (coin: Coin): Promise<SpecificCosmos> => {
    return new Promise<SpecificCosmos>(resolve => {
      const defaultGas = coin.chain == Chain.Dydx ? 2500000000000000 : 7500

      const result: SpecificCosmos = {
        gas: defaultGas,
        transactionType: 0,
        gasPrice: Number(formatUnits(defaultGas, coin.decimals)),
        fee: defaultGas,
        accountNumber: 0,
        sequence: 0,
      }

      this.getAccountData(coin.address)
        .then(account => {
          if (account) {
            result.accountNumber = Number(account.accountNumber)
            result.sequence = Number(account.sequence)
          } else {
            console.error('No account data found')
          }
          resolve(result)
        })
        .catch(error => {
          console.error(error)
          resolve(result) // Ensure promise resolves even on error
        })
    })
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
      this.getSpecificTransactionInfo(coin).then(specificData => {
        const cosmosSpecific = create(CosmosSpecificSchema, {
          accountNumber: BigInt(specificData.accountNumber),
          sequence: BigInt(specificData.sequence),
          gas: BigInt(specificData.gas),
          transactionType: specificData.transactionType,
        })

        const keysignPayload = create(KeysignPayloadSchema, {
          toAddress: transaction.transactionDetails.to,
          toAmount: transaction.transactionDetails.amount?.amount
            ? BigInt(
                parseInt(String(transaction.transactionDetails.amount.amount))
              ).toString()
            : '0',
          memo: transaction.transactionDetails.data,
          vaultPublicKeyEcdsa: vault.publicKeyEcdsa,
          vaultLocalPartyId: 'VultiConnect',
          coin,
          blockchainSpecific: {
            case: 'cosmosSpecific',
            value: cosmosSpecific,
          },
        })
        this.keysignPayload = keysignPayload
        resolve(keysignPayload)
      })
    })
  }

  public getPreSignedInputData = (): Promise<Uint8Array> => {
    return new Promise(resolve => {
      const cosmosSpecific = this.keysignPayload?.blockchainSpecific
        .value as unknown as CosmosSpecific
      const coinType = this.chainRef[this.chainKey]
      const pubKeyData = Buffer.from(
        this.keysignPayload?.coin?.hexPublicKey ?? '',
        'hex'
      )
      const toAddr = this.walletCore.AnyAddress.createWithString(
        this.keysignPayload?.toAddress ?? '',
        coinType
      )

      if (!toAddr) {
        throw new Error('invalid to address')
      }

      const denom = this.denom()
      if (!denom) {
        console.error('denom is not defined')
        throw new Error('denom is not defined')
      }

      const message: TW.Cosmos.Proto.Message[] = [
        TW.Cosmos.Proto.Message.create({
          sendCoinsMessage: TW.Cosmos.Proto.Message.Send.create({
            fromAddress: this.keysignPayload?.coin?.address,
            toAddress: this.keysignPayload?.toAddress,
            amounts: [
              TW.Cosmos.Proto.Amount.create({
                amount: this.keysignPayload?.toAmount,
                denom: denom,
              }),
            ],
          }),
        }),
      ]

      const input = TW.Cosmos.Proto.SigningInput.create({
        publicKey: new Uint8Array(pubKeyData),
        signingMode: SigningMode.Protobuf,
        chainId: this.walletCore.CoinTypeExt.chainId(coinType),
        accountNumber: new Long(Number(cosmosSpecific.accountNumber)),
        sequence: new Long(Number(cosmosSpecific.sequence)),
        mode: BroadcastMode.SYNC,
        memo:
          cosmosSpecific.transactionType !== TransactionType.VOTE
            ? (this.keysignPayload?.memo ?? '')
            : '',
        messages: message,
        fee: TW.Cosmos.Proto.Fee.create({
          gas: new Long(200000),
          amounts: [
            TW.Cosmos.Proto.Amount.create({
              amount: cosmosSpecific.gas.toString(),
              denom: denom,
            }),
          ],
        }),
      })
      resolve(TW.Cosmos.Proto.SigningInput.encode(input).finish())
    })
  }

  public getSignedTransaction = ({
    inputData,
    signature,
    transaction,
    vault,
  }: SignedTransaction): Promise<{ txHash: string; raw: any }> => {
    return new Promise((resolve, reject) => {
      if (inputData && transaction && vault) {
        const pubkeyCosmos = vault.chains.find(
          chain => chain.chain === transaction.chain.chain
        )?.derivationKey

        if (pubkeyCosmos) {
          const coinType = this.walletCore.CoinType.thorchain
          const allSignatures = this.walletCore.DataVector.create()
          const publicKeys = this.walletCore.DataVector.create()
          const publicKeyData = Buffer.from(pubkeyCosmos, 'hex')
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

  protected getSignature(signature: SignatureProps): Uint8Array {
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

  protected async getAccountData(
    address: string
  ): Promise<CosmosAccountData | null> {
    const url = this.accountNumberURL(address)

    if (!url) {
      return null
    }
    return api.cosmos.getAccountData(url)
  }

  protected accountNumberURL(address: string): string | null {
    address.toString() // for skiping eslint
    throw new Error('must override')
  }

  protected async calculateFee(_coin?: Coin): Promise<number> {
    throw new Error('not implemented')
  }

  protected denom(): string {
    throw new Error('must override')
  }
}

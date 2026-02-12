import { Chain } from '@core/chain/Chain'
import { decodeTrc20TransferData } from '@core/chain/chains/tron/trc20/decodeTrc20TransferData'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { deserializeSigningOutput } from '@core/chain/tw/signingOutput'
import { callPopup } from '@core/inpage-provider/popup'
import {
  TransactionDetails,
  TronMsgType,
} from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import { match } from '@lib/utils/match'
import { TronWeb, Trx, Types } from 'tronweb'
import { fromHex, isArray } from 'tronweb/utils'

import { processSignature } from '../ethereum'

type SignedStringOrSignedTransaction<
  T extends string | Types.Transaction | Types.SignedTransaction,
> = T extends string ? string : Types.SignedTransaction & T

const isTransaction = (tx: unknown): tx is Types.Transaction => {
  return !!tx && typeof tx === 'object' && 'raw_data' in (tx as any)
}

export class VultisigTronWebTrx extends Trx {
  constructor(web: TronWeb) {
    super(web)
  }
  sign = async <T extends Types.SignedTransaction | Types.Transaction | string>(
    transaction: T,
    _privateKey?: string | false,
    useTronHeader: boolean = true,
    _multisig?: boolean
  ): Promise<SignedStringOrSignedTransaction<T>> => {
    if (isTransaction(transaction)) {
      const getTransactionDetails = async (): Promise<TransactionDetails> => {
        const [contract] = transaction.raw_data.contract
        return match(contract.type as unknown as TronMsgType, {
          TransferContract: async () => {
            const transferContract = contract.parameter
              .value as Types.TransferContract
            return {
              asset: { ticker: 'TRX' },
              to: fromHex(transferContract.to_address),
              from: fromHex(transferContract.owner_address),
              amount: {
                amount: transferContract.amount.toString(),
                decimals: chainFeeCoin.Tron.decimals,
              },
              msgPayload: {
                case: TronMsgType.TRON_TRANSFER_CONTRACT,
                value: {
                  ...transferContract,
                  owner_address: fromHex(transferContract.owner_address),
                  to_address: fromHex(transferContract.to_address),
                },
                meta: {
                  expiration: transaction.raw_data.expiration,
                  timestamp: transaction.raw_data.timestamp,
                  refBlockBytesHex: transaction.raw_data.ref_block_bytes,
                  refBlockHashHex: transaction.raw_data.ref_block_hash,
                },
              },
              data: transaction.raw_data.data
                ? Buffer.from(
                    transaction.raw_data.data as string,
                    'hex'
                  ).toString('utf8')
                : undefined,
              gasSettings: {
                gasLimit: transaction.raw_data.fee_limit
                  ? transaction.raw_data.fee_limit.toString()
                  : undefined,
              },
              skipBroadcast: true,
            } as TransactionDetails
          },
          TriggerSmartContract: async () => {
            const triggerSmartContract = contract.parameter
              .value as Types.TriggerSmartContract
            const contractAddress = fromHex(
              triggerSmartContract.contract_address
            )

            let asset: TransactionDetails['asset'] = { ticker: 'TRX' }
            let amount = {
              amount: triggerSmartContract.call_value?.toString() ?? '0',
              decimals: chainFeeCoin.Tron.decimals,
            }

            if (triggerSmartContract.token_id) {
              const tokenInfo = await this.getTokenByID(
                triggerSmartContract.token_id
              )
              asset = { ticker: tokenInfo.abbr }
            }

            const trc20Transfer = decodeTrc20TransferData(
              triggerSmartContract.data ?? ''
            )

            if (trc20Transfer) {
              asset = {
                ticker: 'TRC20',
                contractAddress,
              }
              amount = {
                amount: trc20Transfer.amount.toString(),
                decimals: 6,
              }
            }

            return {
              asset,
              amount,
              to: trc20Transfer ? trc20Transfer.recipient : contractAddress,
              from: fromHex(triggerSmartContract.owner_address),
              data: transaction.raw_data.data
                ? Buffer.from(
                    transaction.raw_data.data as string,
                    'hex'
                  ).toString('utf8')
                : undefined,
              msgPayload: {
                case: TronMsgType.TRON_TRIGGER_SMART_CONTRACT,
                value: {
                  ...triggerSmartContract,
                  owner_address: fromHex(triggerSmartContract.owner_address),
                  contract_address: fromHex(
                    triggerSmartContract.contract_address
                  ),
                },
                meta: {
                  expiration: transaction.raw_data.expiration,
                  timestamp: transaction.raw_data.timestamp,
                  refBlockBytesHex: transaction.raw_data.ref_block_bytes,
                  refBlockHashHex: transaction.raw_data.ref_block_hash,
                },
              },
              gasSettings: {
                gasLimit: transaction.raw_data.fee_limit
                  ? transaction.raw_data.fee_limit.toString()
                  : undefined,
              },
              skipBroadcast: true,
            } as TransactionDetails
          },
          TransferAssetContract: async () => {
            const transferAssetContract = contract.parameter
              .value as Types.TransferAssetContract

            const tokenInfo = await this.getTokenListByName(
              transferAssetContract.asset_name
            )

            if (!tokenInfo || (isArray(tokenInfo) && tokenInfo.length === 0)) {
              throw new Error(
                `Token ${transferAssetContract.asset_name} not found`
              )
            }
            const ticker = isArray(tokenInfo)
              ? tokenInfo[0].abbr
              : tokenInfo.abbr

            return {
              asset: {
                ticker,
              },
              to: fromHex(transferAssetContract.to_address),
              from: fromHex(transferAssetContract.owner_address),
              amount: {
                amount: transferAssetContract.amount.toString(),
                decimals: chainFeeCoin.Tron.decimals,
              },
              msgPayload: {
                case: TronMsgType.TRON_TRANSFER_ASSET_CONTRACT,
                value: {
                  ...transferAssetContract,
                  owner_address: fromHex(transferAssetContract.owner_address),
                  to_address: fromHex(transferAssetContract.to_address),
                },
                meta: {
                  expiration: transaction.raw_data.expiration,
                  timestamp: transaction.raw_data.timestamp,
                  refBlockBytesHex: transaction.raw_data.ref_block_bytes,
                  refBlockHashHex: transaction.raw_data.ref_block_hash,
                },
              },
              data: transaction.raw_data.data
                ? Buffer.from(
                    transaction.raw_data.data as string,
                    'hex'
                  ).toString('utf8')
                : undefined,
              gasSettings: {
                gasLimit: transaction.raw_data.fee_limit
                  ? transaction.raw_data.fee_limit.toString()
                  : undefined,
              },
              skipBroadcast: true,
            } as TransactionDetails
          },
        })
      }

      const details = await getTransactionDetails()

      const [{ data }] = await callPopup(
        {
          sendTx: {
            keysign: {
              transactionDetails: details,
              chain: Chain.Tron,
            },
          },
        },
        {
          account: details.from,
        }
      )
      const { signature } = deserializeSigningOutput(Chain.Tron, data)
      return {
        ...(transaction as Types.Transaction),
        signature: [Buffer.from(signature).toString('hex')],
      } as unknown as SignedStringOrSignedTransaction<T>
    } else if (typeof transaction === 'string') {
      const signature = await callPopup({
        signMessage: {
          sign_message: {
            chain: Chain.Tron,
            message: transaction,
            useTronHeader,
          },
        },
      })

      return processSignature(signature) as SignedStringOrSignedTransaction<T>
    }
    throw new Error('Unsupported transaction type')
  }

  signMessage = async <
    T extends Types.SignedTransaction | Types.Transaction | string,
  >(
    transaction: T,
    privateKey?: string | false,
    useTronHeader?: boolean,
    multisig?: boolean
  ): Promise<SignedStringOrSignedTransaction<T>> => {
    return (await this.sign(
      transaction,
      privateKey,
      useTronHeader,
      multisig
    )) as SignedStringOrSignedTransaction<T>
  }

  // @ts-expect-error - base class types signMessageV2 as sync, but wallet implementations are async (requires user confirmation popup)
  signMessageV2 = async (
    message: string | Uint8Array | Array<number>,
    _privateKey?: string
  ): Promise<string> => {
    const messageStr =
      typeof message === 'string'
        ? message
        : Buffer.from(message as Uint8Array).toString('utf8')
    const signature = await callPopup({
      signMessage: {
        sign_message: {
          chain: Chain.Tron,
          message: messageStr,
          signMessageV2: true,
        },
      },
    })

    return processSignature(signature)
  }
}

export class VultisigTronWeb extends TronWeb {
  constructor() {
    super({
      solidityNode: 'https://api.trongrid.io',
      fullHost: 'https://api.trongrid.io',
    })
  }

  // @ts-expect-error - VultisigTronWebTrx makes signMessageV2 async for wallet popup flow
  trx: VultisigTronWebTrx = new VultisigTronWebTrx(this)
}

import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { callPopup } from '@core/inpage-provider/popup'
import {
  TransactionDetails,
  TronMsgType,
} from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import { TronWeb, Trx, Types } from 'tronweb'
import { fromHex, isArray } from 'tronweb/utils'

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
    transaction: T
  ): Promise<SignedStringOrSignedTransaction<T>> => {
    if (!isTransaction(transaction))
      throw new Error('Unsupported transaction type')
    const getTransactionDetails = async (): Promise<TransactionDetails> => {
      const [contract] = transaction.raw_data.contract

      switch (contract.type) {
        case Types.ContractType.TransferContract: {
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
            },
            data: transaction.raw_data.data as string,
            gasSettings: {
              gasLimit: transaction.raw_data.fee_limit
                ? transaction.raw_data.fee_limit.toString()
                : undefined,
            },
          }
        }
        case Types.ContractType.TriggerSmartContract: {
          const triggerSmartContract = contract.parameter
            .value as Types.TriggerSmartContract

          let asset = { ticker: 'TRX' }
          if (triggerSmartContract.token_id) {
            const tokenInfo = await this.getTokenByID(
              triggerSmartContract.token_id
            )
            asset = { ticker: tokenInfo.abbr }
          }

          return {
            asset,
            amount: {
              amount: triggerSmartContract.call_value?.toString() ?? '0',
              decimals: chainFeeCoin.Tron.decimals,
            },
            to: fromHex(triggerSmartContract.contract_address),
            from: fromHex(triggerSmartContract.owner_address),
            data: transaction.raw_data.data as string,
            msgPayload: {
              case: TronMsgType.TRON_TRIGGER_SMART_CONTRACT,
              value: {
                ...triggerSmartContract,
                owner_address: fromHex(triggerSmartContract.owner_address),
                contract_address: fromHex(
                  triggerSmartContract.contract_address
                ),
              },
            },
            gasSettings: {
              gasLimit: transaction.raw_data.fee_limit
                ? transaction.raw_data.fee_limit.toString()
                : undefined,
            },
          }
        }
        case Types.ContractType.TransferAssetContract: {
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
          const ticker = isArray(tokenInfo) ? tokenInfo[0].abbr : tokenInfo.abbr

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
            },
            data: transaction.raw_data.data as string,
            gasSettings: {
              gasLimit: transaction.raw_data.fee_limit
                ? transaction.raw_data.fee_limit.toString()
                : undefined,
            },
          }
        }
      }

      throw new Error('Unsupported contract type')
    }

    const details = await getTransactionDetails()

    const { hash } = await callPopup(
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

    return {
      ...(transaction as Types.Transaction),
      signature: [hash],
      // This is a temporary workaround for some dApps until we fix the issue with the txID result to match expected one
      txID: hash,
    } as unknown as SignedStringOrSignedTransaction<T>
  }
}

export class VultisigTronWeb extends TronWeb {
  constructor() {
    super({
      solidityNode: 'https://api.trongrid.io',
      fullHost: 'https://api.trongrid.io',
    })
  }

  trx: VultisigTronWebTrx = new VultisigTronWebTrx(this)
}

import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { callPopup } from '@core/inpage-provider/popup'
import { TransactionDetails } from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import { TronWeb, Trx, Types } from 'tronweb'
import { fromHex } from 'tronweb/utils'

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
    const getTransactionDetails = (): TransactionDetails => {
      console.log('transaction', transaction)
      if (!isTransaction(transaction))
        throw new Error('Unsupported transaction type')

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
              case: Types.ContractType.TransferContract,
              value: transferContract,
            },
            data: transaction.raw_data.data as string,
          }
        }
        case Types.ContractType.TriggerSmartContract: {
          const triggerSmartContract = contract.parameter
            .value as Types.TriggerSmartContract

          return {
            asset: { ticker: 'TRX' },
            amount: {
              amount: triggerSmartContract.call_value?.toString() ?? '0',
              decimals: chainFeeCoin.Tron.decimals,
            },
            to: fromHex(triggerSmartContract.contract_address),
            from: fromHex(triggerSmartContract.owner_address),
            data: transaction.raw_data.data as string,
            msgPayload: {
              case: Types.ContractType.TriggerSmartContract,
              value: triggerSmartContract,
            },
          }
        }
      }

      throw new Error('Unsupported contract type')
    }

    const details = getTransactionDetails()

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

    return hash as SignedStringOrSignedTransaction<T>
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

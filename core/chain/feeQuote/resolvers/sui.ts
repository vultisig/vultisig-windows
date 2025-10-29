import { getSuiClient } from '@core/chain/chains/sui/client'
import { suiGasBudget, suiMinGasBudget } from '@core/chain/chains/sui/config'
import { attempt, withFallback } from '@lib/utils/attempt'
import { bigIntMax } from '@lib/utils/bigint/bigIntMax'
import { Transaction } from '@mysten/sui/transactions'

import { FeeQuoteResolver } from '../resolver'

const gasBudgetMultiplier = (value: bigint) => (value * 115n) / 100n

export const getSuiFeeQuote: FeeQuoteResolver<'sui'> = async ({
  coin,
  amount,
  receiver,
}) => {
  const client = getSuiClient()
  const gasPrice = await client.getReferenceGasPrice()

  const getGasBudget = async () => {
    const tx = new Transaction()
    tx.setSender(coin.address)

    const coinForTransfer = tx.splitCoins(tx.gas, [tx.pure.u64(amount)])
    tx.transferObjects([coinForTransfer], tx.pure.address(receiver))

    const built = await tx.build({ client })

    const {
      effects: {
        gasUsed: { computationCost, storageCost },
      },
    } = await client.dryRunTransactionBlock({ transactionBlock: built })

    const totalCost = BigInt(computationCost) + BigInt(storageCost)

    return bigIntMax(totalCost, suiMinGasBudget)
  }

  const gasBudget = gasBudgetMultiplier(
    await withFallback(attempt(getGasBudget()), suiGasBudget)
  )

  return { gas: gasPrice, gasBudget }
}

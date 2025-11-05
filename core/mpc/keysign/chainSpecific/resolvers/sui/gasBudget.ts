import { getSuiClient } from '@core/chain/chains/sui/client'
import { Transaction } from '@mysten/sui/transactions'

type EstimateSuiFeeInput = {
  sender: string
  recipient: string
  amount: bigint
  gasPrice: bigint
}

const minNetworkGasBudget = 2000n
const safetyMarginPercent = 15n

export const getSuiGasBudget = async ({
  sender,
  recipient,
  amount,
  gasPrice,
}: EstimateSuiFeeInput): Promise<bigint> => {
  const client = getSuiClient()

  const tx = new Transaction()
  tx.setSender(sender)
  tx.setGasPrice(gasPrice)

  const [coin] = tx.splitCoins(tx.gas, [amount])
  tx.transferObjects([coin], recipient)

  const txBytes = await tx.build({ client })

  const dryRunResult = await client.dryRunTransactionBlock({
    transactionBlock: txBytes,
  })

  const gasUsed = dryRunResult.effects.gasUsed
  const computationCost = BigInt(gasUsed.computationCost)
  const storageCost = BigInt(gasUsed.storageCost)

  const gasBudget = computationCost + storageCost

  const safeGasBudget = gasBudget + (gasBudget * safetyMarginPercent) / 100n

  return safeGasBudget < minNetworkGasBudget
    ? minNetworkGasBudget
    : safeGasBudget
}

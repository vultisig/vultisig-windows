import { Chain, OtherChain } from '@core/chain/Chain'
import { getSuiClient } from '@core/chain/chains/sui/client'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { attempt } from '@lib/utils/attempt'

import { TxStatusResolver } from '../resolver'

export const getSuiTxStatus: TxStatusResolver<OtherChain.Sui> = async ({
  hash,
}) => {
  const client = getSuiClient()

  const { data, error } = await attempt(
    client.getTransactionBlock({
      digest: hash,
      options: { showEffects: true },
    })
  )

  if (error || !data) {
    return { status: 'pending' }
  }

  const effectsStatus = data.effects?.status?.status

  if (effectsStatus === 'success') {
    const gasUsed = data.effects?.gasUsed
    const feeCoin = chainFeeCoin[Chain.Sui]
    const receipt =
      gasUsed != null &&
      typeof gasUsed === 'object' &&
      'computationCost' in gasUsed &&
      'storageCost' in gasUsed
        ? {
            feeAmount:
              BigInt(String(gasUsed.computationCost)) +
              BigInt(String(gasUsed.storageCost)),
            feeDecimals: feeCoin.decimals,
            feeTicker: feeCoin.ticker,
          }
        : undefined

    return { status: 'success', receipt }
  }

  if (effectsStatus === 'failure') {
    return { status: 'error' }
  }

  return { status: 'pending' }
}

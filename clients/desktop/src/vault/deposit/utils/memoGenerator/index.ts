import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { match } from '@lib/utils/match'
import { FieldValues } from 'react-hook-form'

import { MayaChainPool } from '../../../../lib/types/deposit'
import { ChainAction } from '../../ChainAction'

interface MemoParams {
  selectedChainAction: ChainAction
  depositFormData: FieldValues
  bondableAsset: MayaChainPool['asset']
  fee?: number | bigint
}

export const generateMemo = ({
  selectedChainAction,
  depositFormData,
  bondableAsset,
}: MemoParams): string => {
  const { nodeAddress, amount, lpUnits, customMemo, provider, operatorFee } =
    extractFormValues(depositFormData)

  return match(selectedChainAction, {
    stake: () => 'd',
    unstake: () => 'w',
    bond_with_lp: () => {
      if (provider) {
        return operatorFee
          ? `BOND:${nodeAddress}:${provider}:${operatorFee}`
          : `BOND:${nodeAddress}:${provider}`
      }
      return `BOND:${bondableAsset}:${lpUnits}:${nodeAddress}`
    },
    bond: () => {
      if (provider) {
        return operatorFee
          ? `BOND:${nodeAddress}:${provider}:${operatorFee}`
          : `BOND:${nodeAddress}:${provider}`
      }
      // If no provider, include only operatorFee (no 'amount' field)
      return operatorFee
        ? `BOND:${nodeAddress}:${operatorFee}`
        : `BOND:${nodeAddress}`
    },
    unbond_with_lp: () => `UNBOND:${bondableAsset}:${lpUnits}:${nodeAddress}`,
    unbond: () => {
      const runeDecimals = chainFeeCoin[Chain.THORChain].decimals
      const amountInUnits = amount
        ? Math.round(amount * Math.pow(10, runeDecimals))
        : 0
      return provider
        ? `UNBOND:${nodeAddress}:${amountInUnits}:${provider}`
        : `UNBOND:${nodeAddress}:${amountInUnits}`
    },
    custom: () => shouldBePresent(customMemo, 'Custom memo'),
    leave: () => `LEAVE:${nodeAddress}`,
    vote: () => 'VOTE',
  })
}

function extractFormValues(formData: FieldValues) {
  return {
    nodeAddress: formData.nodeAddress as string | null,
    amount: formData.amount as number | null,
    lpUnits: formData.lpUnits as number | null,
    customMemo: formData.customMemo as string | undefined,
    percentage: formData.percentage as number | null,
    affiliateFee: formData.affiliateFee as number | null,
    provider: formData.provider as string | null,
    operatorFee: formData.operatorFee as string | null,
  }
}

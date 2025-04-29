import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { match } from '@lib/utils/match'
import { FieldValues } from 'react-hook-form'

import { MayaChainPool } from '../../../../lib/types/deposit'
import { ChainAction } from '../../ChainAction'
import { sourceChannelByChain } from '../../DepositForm/chainOptionsConfig'

interface MemoParams {
  selectedChainAction: ChainAction
  depositFormData: FieldValues
  bondableAsset: MayaChainPool['asset']
  chain: Chain
}

export const generateMemo = ({
  selectedChainAction,
  depositFormData,
  bondableAsset,
  chain,
}: MemoParams): string => {
  const {
    nodeAddress,
    amount,
    lpUnits,
    customMemo,
    provider,
    operatorFee,
    destinationChain,
    destinationAddress,
    memo,
  } = extractFormValues(depositFormData)

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
    ibc_transfer: () => {
      if (!destinationChain || !destinationAddress) {
        throw new Error('Invalid IBC transfer parameters')
      }

      const sourceMap = sourceChannelByChain[chain]
      const sourceChannel = sourceMap?.[destinationChain]

      if (!sourceChannel) {
        throw new Error(
          `Missing source channel for ${chain} -> ${destinationChain}`
        )
      }

      return `${destinationChain}:${sourceChannel}:${destinationAddress}${memo ? `:${memo}` : ''}`
    },
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
    destinationChain: formData.destinationChain as string | null,
    destinationChannel: formData.destinationChannel as string | null,
    destinationAddress: formData.destinationAddress as string | null,
    memo: formData.memo as string | null,
  }
}

import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { Coin } from '@core/chain/coin/Coin'
import { getDenom } from '@core/chain/coin/utils/getDenom'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { match } from '@lib/utils/match'
import { FieldValues } from 'react-hook-form'

import { ChainAction } from '../../ChainAction'
import { StakeableChain } from '../../constants'
import { sourceChannelByChain } from '../../DepositForm/chainOptionsConfig'
import { MayaChainPool } from '../../types/mayaChain'

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
    selectedCoin,
    thorchainAddress,
  } = extractFormValues(depositFormData)

  return match(selectedChainAction, {
    stake: () =>
      match(chain as StakeableChain, {
        Ton: () => 'd',
        THORChain: () => {
          if (selectedCoin?.ticker === 'TCY') {
            return 'tcy+'
          }
          throw new Error(
            `Unsupported chain and token for staking memo: ${chain}`
          )
        },
      }),
    unstake: () =>
      match(chain as StakeableChain, {
        Ton: () => 'w',
        THORChain: () => {
          if (selectedCoin?.ticker === 'TCY') {
            const pct = shouldBePresent(
              depositFormData.percentage,
              'Percentage'
            )
            const basisPoints = Math.floor(pct * 100)
            return `tcy-:${basisPoints}`
          }
          throw new Error(
            `Unsupported chain and token for staking memo: ${chain}`
          )
        },
      }),
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
      if (!destinationChain || !nodeAddress) {
        throw new Error('Invalid IBC transfer parameters')
      }

      const sourceMap = sourceChannelByChain[chain]
      const sourceChannel = sourceMap?.[destinationChain]

      if (!sourceChannel) {
        throw new Error(
          `Missing source channel for ${chain} -> ${destinationChain}`
        )
      }

      return `${destinationChain}:${sourceChannel}:${nodeAddress}`
    },
    merge: () => {
      const token = shouldBePresent(selectedCoin, 'Token to merge')
      return `merge:THOR.${getDenom(token)}`
    },
    switch: () => {
      return `switch:${thorchainAddress}`
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
    selectedCoin: formData.selectedCoin as Coin | null,
    thorchainAddress: formData.thorchainAddress as string | null,
  }
}

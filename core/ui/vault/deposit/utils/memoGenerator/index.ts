import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { Chain, CosmosChain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { Coin, CoinKey } from '@core/chain/coin/Coin'
import { getDenom } from '@core/chain/coin/utils/getDenom'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { match } from '@lib/utils/match'
import { FieldValues } from 'react-hook-form'

import { ChainAction } from '../../ChainAction'
import { StakeableChain } from '../../config'
import { sourceChannelByChain } from '../../DepositForm/chainOptionsConfig'
import { MayaChainPool } from '../../types/mayaChain'

type MemoParams = {
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
    deposit_yRune: () => '',
    deposit_yTcy: () => '',
    withdraw_yRune: () => '',
    withdraw_yTcy: () => '',
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
      const denom =
        token.chain === Chain.THORChain
          ? token.ticker.toLowerCase()
          : getDenom(token as CoinKey<CosmosChain>)

      return `merge:THOR.${denom}`
    },
    switch: () => {
      return `switch:${thorchainAddress}`
    },
    unmerge: () => {
      if (!amount) {
        throw new Error('Amount is required for unmerge')
      }
      if (!selectedCoin) {
        throw new Error('Token is required for unmerge')
      }

      const sharesRaw = toChainAmount(amount, selectedCoin.decimals)
      // For unmerge, use the full coin ID (e.g., "thor.kuji")
      const denom = shouldBePresent(selectedCoin.id)
      const memo = `unmerge:${denom.toLowerCase()}:${sharesRaw}`

      return memo
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

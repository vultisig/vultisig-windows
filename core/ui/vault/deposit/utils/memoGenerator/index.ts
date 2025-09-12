import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { Chain, CosmosChain } from '@core/chain/Chain'
import { rujiraStakingConfig } from '@core/chain/chains/cosmos/thor/rujira/config'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { Coin, CoinKey } from '@core/chain/coin/Coin'
import { getDenom } from '@core/chain/coin/utils/getDenom'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { match } from '@lib/utils/match'
import { FieldValues } from 'react-hook-form'

import { ChainAction } from '../../ChainAction'
import { StakeableChain } from '../../config'
import { MayaChainPool } from '../../types/mayaChain'
import { sourceChannelByChain } from '../getDepositFormConfig'

type MemoParams = {
  selectedChainAction: ChainAction
  depositFormData: FieldValues
  bondableAsset: MayaChainPool['asset']
  chain: Chain
  coin: AccountCoin
}

export const generateMemo = ({
  selectedChainAction,
  depositFormData,
  bondableAsset,
  chain,
  coin,
}: MemoParams) => {
  const {
    nodeAddress,
    amount,
    lpUnits,
    customMemo,
    provider,
    operatorFee,
    destinationChain,
    thorchainAddress,
  } = extractFormValues(depositFormData)

  return match(selectedChainAction, {
    withdraw_ruji_rewards: () => `claim:${rujiraStakingConfig.bondDenom}`,
    mint: () => {
      const token = shouldBePresent(coin, 'Selected coin')
      const amountInUnits = toChainAmount(
        shouldBePresent(amount),
        token.decimals
      ).toString()
      const base = token.ticker.toLowerCase()
      if (base !== 'rune' && base !== 'tcy')
        throw new Error('Mint supports RUNE/TCY only')
      return `receive:${base}:${amountInUnits}`
    },
    redeem: () => {
      const token = shouldBePresent(coin, 'Selected coin')
      const amountInUnits = toChainAmount(
        shouldBePresent(amount),
        token.decimals
      ).toString()
      const denom = shouldBePresent(token.id)
      return `sell:${denom}:${amountInUnits}`
    },
    stake: () =>
      match(chain as StakeableChain, {
        Ton: () => 'd',
        THORChain: () => {
          if (coin.ticker === 'TCY') {
            return 'tcy+'
          }

          if (coin.ticker === 'RUJI') {
            const chainAmount = toChainAmount(
              shouldBePresent(Number(amount)),
              coin.decimals
            ).toString()
            return `bond:${rujiraStakingConfig.bondDenom}:${chainAmount}`
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
          if (coin.ticker === 'TCY') {
            if (depositFormData.autoCompound) return ''

            const raw = (depositFormData as any).percentage

            const pct = typeof raw === 'string' ? Number(raw) : Number(raw)
            if (!Number.isFinite(pct) || pct <= 0 || pct > 100) {
              throw new Error('Percentage must be 0-100')
            }
            const basisPoints = Math.floor(pct * 100)
            return `tcy-:${basisPoints}`
          }

          if (coin.ticker === 'RUJI') {
            const amt = shouldBePresent(amount, 'Amount')
            const amtNum = typeof amt === 'string' ? Number(amt) : amt
            if (!Number.isFinite(amtNum) || amtNum <= 0) {
              throw new Error('Amount is required for RUJI unstake')
            }
            const chainAmount = toChainAmount(amtNum, coin.decimals).toString()
            return `withdraw:${rujiraStakingConfig.bondDenom}:${chainAmount}`
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
      const token = shouldBePresent(coin, 'Token to merge')
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
      if (!coin) {
        throw new Error('Token is required for unmerge')
      }

      const sharesRaw = toChainAmount(amount, coin.decimals)
      // For unmerge, use the full coin ID (e.g., "thor.kuji")
      const denom = shouldBePresent(coin.id)
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
    coin: formData.coin as Coin | null,
    thorchainAddress: formData.thorchainAddress as string | null,
    autoCompound: Boolean(formData.autoCompound),
  }
}

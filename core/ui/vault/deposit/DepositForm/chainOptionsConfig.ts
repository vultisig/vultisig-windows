import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { isValidAddress } from '@core/chain/utils/isValidAddress'
import { match } from '@lib/utils/match'
import { WalletCore } from '@trustwallet/wallet-core'
import type { TFunction } from 'i18next'
import { z } from 'zod'

import { isStakeableChain, StakeableChain } from '../constants'

export const sourceChannelByChain: Partial<
  Record<Chain, Partial<Record<Chain | string, string>>>
> = {
  [Chain.Kujira]: {
    [Chain.Cosmos]: 'channel-0',
    [Chain.Akash]: 'channel-64',
    [Chain.Dydx]: 'channel-118',
    [Chain.Noble]: 'channel-62',
    [Chain.Osmosis]: 'channel-3',
  },
  [Chain.Osmosis]: {
    [Chain.Cosmos]: 'channel-0',
  },
  [Chain.Cosmos]: {
    [Chain.Kujira]: 'channel-343',
    [Chain.Osmosis]: 'channel-141',
    [Chain.Noble]: 'channel-536',
    [Chain.Akash]: 'channel-184',
  },
}

export const getIbcDropdownOptions = (srcChain: Chain) => {
  const destinations = sourceChannelByChain[srcChain]
  if (!destinations) return []

  return Object.keys(destinations).map(dst => {
    const dstChain = dst as Chain
    const ticker = chainFeeCoin[dstChain]?.ticker ?? ''
    return {
      label: `${dstChain} ${ticker}`,
      value: dstChain,
    }
  })
}

const CoinSchema = z.object({
  chain: z.string(),
  id: z.string(),
  priceProviderId: z.string().optional(),
  decimals: z.number(),
  ticker: z.string(),
  logo: z.string(),
})

export const getRequiredFieldsPerChainAction = (
  t: TFunction,
  chain: Chain
) => ({
  merge: {
    fields: [
      {
        name: 'amount',
        type: 'number',
        label: 'Amount',
        required: true,
      },
    ],
    schema: (
      chain: Chain,
      walletCore: WalletCore,
      totalAmountAvailable: number
    ) => {
      return z.object({
        nodeAddress: z.string().min(1, 'Required'),
        selectedCoin: CoinSchema,
        amount: z
          .string()
          .transform(val => Number(val))
          .pipe(z.number().positive().min(0.01).max(totalAmountAvailable)),
      })
    },
  },
  switch: {
    fields: [
      {
        name: 'amount',
        type: 'number',
        label: 'Amount',
        required: true,
      },
    ],
    schema: (
      chain: Chain,
      walletCore: WalletCore,
      totalAmountAvailable: number
    ) =>
      z.object({
        selectedCoin: CoinSchema,
        amount: z
          .string()
          .transform(val => Number(val))
          .pipe(z.number().positive().min(0.01).max(totalAmountAvailable)),
        nodeAddress: z.string().min(1, 'Required'),
        thorchainAddress: z.string().min(1, 'Required'),
      }),
  },
  ibc_transfer: {
    fields: [
      {
        name: 'amount',
        type: 'number',
        label: t('amount'),
        required: true,
      },
    ],
    schema: (
      chain: Chain,
      walletCore: WalletCore,
      totalAmountAvailable: number
    ) =>
      z.object({
        selectedCoin: CoinSchema,
        destinationChain: z.string().min(1, 'Destination Chain is required'),
        nodeAddress: z.string().min(1, 'Destination Address is required'),
        amount: z
          .string()
          .transform(val => Number(val))
          .pipe(
            z
              .number()
              .positive()
              .min(0.001, 'Amount must be greater than 0')
              .max(totalAmountAvailable, 'Amount exceeds balance')
          ),
      }),
  },
  bond: {
    fields: [
      {
        name: 'nodeAddress',
        type: 'text',
        label: t('node_address'),
        required: true,
      },
      {
        name: 'provider',
        type: 'text',
        label: t('provider'),
        required: false,
      },
      {
        name: 'operatorFee',
        type: 'number',
        label: t('operator_fee'),
        required: false,
      },
      {
        name: 'amount',
        type: 'number',
        label: t('amount'),
        required: true,
      },
    ],
    schema: (
      chain: Chain,
      walletCore: WalletCore,
      totalAmountAvailable: number
    ) =>
      z.object({
        nodeAddress: z
          .string()
          .refine(address => address.length > 0, {
            message: t('required_node_address'),
          })
          .refine(
            async address => {
              return isValidAddress({
                chain: chain as Chain,
                address,
                walletCore,
              })
            },
            {
              message: t('invalid_node_address'),
            }
          ),
        provider: z.string().optional(),
        operatorFee: z
          .string()
          .transform(val => (val ? Number(val) : undefined))
          .pipe(z.number().optional()),
        amount: z
          .string()
          .transform(val => Number(val))
          .pipe(
            z
              .number()
              .positive()
              .min(0.01, t('amount'))
              .max(totalAmountAvailable, t('chainFunctions.amountExceeded'))
              .refine(val => val > 0, {
                message: t('amount'),
              })
          ),
      }),
  },
  bond_with_lp: {
    fields: [
      {
        name: 'nodeAddress',
        type: 'text',
        label: t('node_address'),
        required: true,
      },
      {
        name: 'lpUnits',
        type: 'number',
        label: t('lp_units'),
        required: true,
      },
      {
        name: 'amount',
        type: 'number',
        label: 'amount',
        required: false,
      },
    ],
    schema: (
      chain: Chain,
      walletCore: WalletCore,
      totalAmountAvailable: number
    ) =>
      z.object({
        nodeAddress: z
          .string()
          .refine(address => address.length > 0, {
            message: t('required_node_address'),
          })
          .refine(
            async address => {
              return isValidAddress({
                chain: chain as Chain,
                address,
                walletCore,
              })
            },
            {
              message: t('invalid_node_address'),
            }
          ),
        bondableAsset: z.string().min(1, t('asset')),
        lpUnits: z
          .string()
          .optional()
          .transform(val => Number(val))
          .pipe(
            z
              .number()
              .positive()
              .min(0.01, t('lp_units'))
              // TODO: need to find out how to find the max amount of LP tokens
              // .max(totalAmountAvailable, t('chainFunctions.amountExceeded'))
              .refine(val => val > 0, {
                message: t('lp_units'),
              })
          ),
        amount: z
          .string()
          .optional()
          .transform(val => {
            if (val === undefined || val === '') return undefined
            return Number(val)
          })
          .pipe(
            z
              .number()
              .positive()
              .min(0.01, t('amount'))
              .max(totalAmountAvailable, t('chainFunctions.amountExceeded'))
              .optional()
          ),
      }),
  },
  unbond: {
    fields: [
      {
        name: 'nodeAddress',
        type: 'text',
        label: t('node_address'),
        required: true,
      },
      {
        name: 'amount',
        type: 'number',
        label: t('amount'),
        required: true,
      },
      {
        name: 'provider',
        type: 'text',
        label: t('provider'),
        required: false,
      },
    ],
    schema: (
      chain: Chain,
      walletCore: WalletCore,
      _totalAmountAvailable: number
    ) =>
      z.object({
        nodeAddress: z
          .string()
          .refine(address => address.length > 0, {
            message: t('required_node_address'),
          })
          .refine(
            async address => {
              return isValidAddress({
                chain: chain as Chain,
                address,
                walletCore,
              })
            },
            {
              message: t('invalid_node_address'),
            }
          ),
        amount: z.string().transform(val => Number(val)),
        provider: z.string().optional(),
      }),
  },
  unbond_with_lp: {
    fields: [
      {
        name: 'nodeAddress',
        type: 'text',
        label: t('node_address'),
        required: true,
      },
      {
        name: 'lpUnits',
        type: 'number',
        label: t('lp_units'),
        required: true,
      },
      {
        name: 'amount',
        type: 'number',
        label: t('amount'),
        required: false,
      },
    ],
    schema: (
      chain: Chain,
      walletCore: WalletCore,
      totalAmountAvailable: number
    ) =>
      z.object({
        nodeAddress: z
          .string()
          .refine(address => address.length > 0, {
            message: t('required_node_address'),
          })
          .refine(
            async address => {
              return isValidAddress({
                chain: chain as Chain,
                address,
                walletCore,
              })
            },
            {
              message: t('invalid_node_address'),
            }
          ),
        lpUnits: z
          .string()
          .optional()
          .transform(val => Number(val))
          .pipe(
            z
              .number()
              .positive()
              .min(0.01, t('lp_units'))
              // TODO: need to find out how to find the max amount of LP tokens
              // .max(totalAmountAvailable, t('chainFunctions.amountExceeded'))
              .refine(val => val > 0, {
                message: t('lp_units'),
              })
          ),
        bondableAsset: z.string().min(1, t('asset')),
        amount: z
          .string()
          .optional()
          .transform(val => {
            if (val === undefined || val === '') return undefined
            return Number(val)
          })
          .pipe(
            z
              .number()
              .positive()
              .min(0.01, t('amount'))
              .max(totalAmountAvailable, t('chainFunctions.amountExceeded'))
              .optional()
          ),
      }),
  },
  leave: {
    fields: [
      {
        name: 'nodeAddress',
        type: 'text',
        label: t('node_address'),
        required: true,
      },
    ],
    schema: (
      chain: Chain,
      walletCore: WalletCore,
      _totalAmountAvailable: number
    ) =>
      z.object({
        nodeAddress: z
          .string()
          .refine(address => address.length > 0, {
            message: t('required_node_address'),
          })
          .refine(
            async address => {
              return isValidAddress({
                chain: chain as Chain,
                address,
                walletCore,
              })
            },
            {
              message: t('invalid_node_address'),
            }
          ),
      }),
  },
  custom: {
    fields: [
      {
        name: 'amount',
        type: 'number',
        label: t('amount'),
        required: false,
      },
      {
        name: 'customMemo',
        type: 'text',
        label: t('chainFunctions.custom.labels.customMemo'),
        required: true,
      },
    ],
    schema: (
      _chain: Chain,
      _walletCore: WalletCore,
      totalAmountAvailable: number
    ) =>
      z.object({
        amount: z
          .string()
          .optional()
          .transform(val =>
            val === '' || val === undefined ? undefined : Number(val)
          )
          .pipe(
            z
              .number()
              .max(totalAmountAvailable, t('chainFunctions.amountExceeded'))
              .min(0, t('amount'))
              .refine(val => val >= 0, {
                message: t('amount'),
              })
              .optional()
          ),
        customMemo: z
          .string()
          .min(1, t('chainFunctions.custom.validations.customMemo')),
      }),
  },
  vote: {
    fields: [
      {
        name: 'proposalId',
        type: 'text',
        label: 'chainFunctions.vote.labels.proposalId',
        required: true,
      },
      {
        name: 'support',
        type: 'boolean',
        label: 'chainFunctions.vote.labels.support',
        required: true,
      },
    ],
    schema: (
      _chain: Chain,
      _walletCore: WalletCore,
      _totalAmountAvailable: number
    ) =>
      z.object({
        proposalId: z
          .string()
          .min(1, t('chainFunctions.vote.validations.proposalId')),
        support: z.boolean(),
      }),
  },
  stake: {
    fields: isStakeableChain(chain)
      ? match(chain as StakeableChain, {
          [Chain.Ton]: () => [
            {
              name: 'amount',
              type: 'number',
              label: t('amount'),
              required: true,
            },
            {
              name: 'validatorAddress',
              type: 'text',
              label: t('validator_address'),
              required: true,
            },
          ],
          [Chain.THORChain]: () => [
            {
              name: 'amount',
              type: 'number',
              label: t('amount'),
              required: true,
            },
          ],
        })
      : [],
    schema: (
      chain: Chain,
      _walletCore: WalletCore,
      totalAmountAvailable: number
    ) => {
      if (!isStakeableChain(chain)) return z.never()

      return match(chain, {
        THORChain: () =>
          z.object({
            selectedCoin: CoinSchema,
            amount: z
              .string()
              .transform(Number)
              .pipe(
                z
                  .number()
                  .positive()
                  .min(0.0001, t('amount'))
                  .max(totalAmountAvailable, t('chainFunctions.amountExceeded'))
              ),
          }),
        Ton: () =>
          z.object({
            amount: z
              .string()
              .transform(val => Number(val))
              .pipe(z.number().positive().min(0.01, t('amount'))),
            validatorAddress: z.string().min(1, t('validator_address')),
          }) as any,
      })
    },
  },
  unstake: {
    fields: isStakeableChain(chain)
      ? match(chain as StakeableChain, {
          [Chain.Ton]: () => [
            {
              name: 'amount',
              type: 'number',
              label: t('amount'),
              required: true,
            },
            {
              name: 'validatorAddress',
              type: 'text',
              label: t('validator_address'),
              required: true,
            },
          ],
          [Chain.THORChain]: () => [],
        })
      : [],
    schema: (
      _chain: Chain,
      _walletCore: WalletCore,
      _totalAmountAvailable: number
    ) => {
      if (!isStakeableChain(chain)) return z.never()

      return match(chain, {
        THORChain: () =>
          z.object({
            selectedCoin: CoinSchema,
            percentage: z
              .string()
              .transform(Number)
              .pipe(z.number().positive().max(100, 'Percentage must be 0-100')),
          }),
        Ton: () =>
          z.object({
            validatorAddress: z.string().min(1, t('validator_address')),
            amount: z
              .string()
              .transform(Number)
              .pipe(z.number().positive().min(0.0001, t('amount'))),
          }) as any,
      })
    },
  },
})

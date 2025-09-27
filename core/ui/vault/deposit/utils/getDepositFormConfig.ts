import { Chain } from '@core/chain/Chain'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { isValidAddress } from '@core/chain/utils/isValidAddress'
import { match } from '@lib/utils/match'
import { WalletCore } from '@trustwallet/wallet-core'
import type { TFunction } from 'i18next'
import { z } from 'zod'

import { ChainAction } from '../ChainAction'
import { isStakeableChain, StakeableChain } from '../config'

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

type GetChainActionConfigParams = {
  t: TFunction
  coin: AccountCoin
  walletCore: WalletCore
  totalAmountAvailable: number
  selectedChainAction: ChainAction
}

type ChainActionConfig = {
  fields: Array<{
    name: string
    type: string
    label: string
    required?: boolean
    hidden?: boolean
  }>
  schema: z.ZodTypeAny
}

export const getDepositFormConfig = ({
  t,
  coin,
  walletCore,
  totalAmountAvailable,
  selectedChainAction,
}: GetChainActionConfigParams) => {
  const chain = coin.chain

  return match<ChainAction, ChainActionConfig>(selectedChainAction, {
    withdraw_ruji_rewards: () => ({
      fields: [],
      schema: z.object({}).superRefine((_val, ctx) => {
        if (totalAmountAvailable <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Nothing to withdraw (balance is 0).',
            path: ['_form'],
          })
        }
      }),
    }),
    mint: () => ({
      fields: [
        { name: 'amount', type: 'number', label: t('amount'), required: true },
      ],
      schema: z.object({
        amount: z
          .string()
          .transform(Number)
          .pipe(z.number().positive().max(totalAmountAvailable)),
      }),
    }),
    redeem: () => ({
      fields: [
        { name: 'amount', type: 'number', label: t('amount'), required: true },
        {
          name: 'slippage',
          type: 'percentage',
          label: t('slippage'),
          required: true,
          default: 1,
        },
      ],
      schema: z.object({
        amount: z
          .string()
          .transform(Number)
          .pipe(z.number().positive().max(totalAmountAvailable)),
        slippage: z
          .string()
          .transform(Number)
          .pipe(z.number().min(0.1).max(7.5)),
      }),
    }),
    unmerge: () => ({
      fields: [
        {
          name: 'amount',
          type: 'number',
          label: 'Amount',
          required: true,
        },
      ],
      schema: z.object({
        amount: z
          .string()
          .transform(val => Number(val))
          .pipe(z.number().positive().max(totalAmountAvailable)),
      }),
    }),
    merge: () => ({
      fields: [
        {
          name: 'amount',
          type: 'number',
          label: 'Amount',
          required: true,
        },
      ],
      schema: z.object({
        nodeAddress: z.string().min(1, 'Required'),
        amount: z
          .string()
          .transform(val => Number(val))
          .pipe(z.number().positive().max(totalAmountAvailable)),
      }),
    }),
    switch: () => ({
      fields: [
        {
          name: 'amount',
          type: 'number',
          label: 'Amount',
          required: true,
        },
      ],
      schema: z.object({
        amount: z
          .string()
          .transform(val => Number(val))
          .pipe(z.number().positive().max(totalAmountAvailable)),
        nodeAddress: z.string().min(1, 'Required'),
        thorchainAddress: z.string().min(1, 'Required'),
      }),
    }),
    ibc_transfer: () => ({
      fields: [
        {
          name: 'amount',
          type: 'number',
          label: t('amount'),
          required: true,
        },
      ],
      schema: z.object({
        destinationChain: z.string().min(1, 'Destination Chain is required'),
        nodeAddress: z.string().min(1, 'Destination Address is required'),
        amount: z
          .string()
          .transform(val => Number(val))
          .pipe(
            z
              .number()
              .positive()
              .max(totalAmountAvailable, 'Amount exceeds balance')
          ),
      }),
    }),
    bond: () => ({
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
      schema: z.object({
        nodeAddress: z
          .string()
          .refine(address => address.length > 0, {
            message: t('required_node_address'),
          })
          .refine(
            address => {
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
              .max(totalAmountAvailable, t('chainFunctions.amountExceeded'))
              .refine(val => val > 0, {
                message: t('amount'),
              })
          ),
      }),
    }),
    bond_with_lp: () => ({
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
      schema: z.object({
        nodeAddress: z
          .string()
          .refine(address => address.length > 0, {
            message: t('required_node_address'),
          })
          .refine(
            address => {
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
              .max(totalAmountAvailable, t('chainFunctions.amountExceeded'))
              .optional()
          ),
      }),
    }),
    unbond: () => ({
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
      schema: z.object({
        nodeAddress: z
          .string()
          .refine(address => address.length > 0, {
            message: t('required_node_address'),
          })
          .refine(
            address => {
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
    }),
    unbond_with_lp: () => ({
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
      schema: z.object({
        nodeAddress: z
          .string()
          .refine(address => address.length > 0, {
            message: t('required_node_address'),
          })
          .refine(
            address => {
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
              .max(totalAmountAvailable, t('chainFunctions.amountExceeded'))
              .optional()
          ),
      }),
    }),
    leave: () => ({
      fields: [
        {
          name: 'nodeAddress',
          type: 'text',
          label: t('node_address'),
          required: true,
        },
      ],
      schema: z.object({
        nodeAddress: z
          .string()
          .refine(address => address.length > 0, {
            message: t('required_node_address'),
          })
          .refine(
            address => {
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
    }),
    custom: () => ({
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
      schema: z.object({
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
              .refine(val => val >= 0, {
                message: t('amount'),
              })
              .optional()
          ),
        customMemo: z
          .string()
          .min(1, t('chainFunctions.custom.validations.customMemo')),
      }),
    }),
    vote: () => ({
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
      schema: z.object({
        proposalId: z
          .string()
          .min(1, t('chainFunctions.vote.validations.proposalId')),
        support: z.boolean(),
      }),
    }),
    stake: () => ({
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
      schema: !isStakeableChain(chain)
        ? z.never()
        : match(chain, {
            THORChain: () =>
              coin.ticker === 'RUJI'
                ? z.object({
                    amount: z
                      .string()
                      .transform(Number)
                      .pipe(
                        z
                          .number()
                          .positive()
                          .max(
                            totalAmountAvailable,
                            t('chainFunctions.amountExceeded')
                          )
                      ),
                  })
                : coin.ticker === 'TCY'
                  ? z.object({
                      amount: z
                        .string()
                        .transform(Number)
                        .pipe(
                          z
                            .number()
                            .positive()
                            .max(
                              totalAmountAvailable,
                              t('chainFunctions.amountExceeded')
                            )
                        ),
                      autoCompound: z.boolean().optional(),
                    })
                  : z.never(),
            Ton: () =>
              z.object({
                amount: z
                  .string()
                  .transform(val => Number(val))
                  .pipe(z.number().positive()),
                validatorAddress: z.string().min(1, t('validator_address')),
              }) as any,
          }),
    }),
    unstake: () => ({
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
            [Chain.THORChain]: () =>
              coin.ticker === 'RUJI'
                ? [
                    {
                      name: 'amount',
                      type: 'number',
                      label: t('amount'),
                      required: true,
                    },
                  ]
                : coin.ticker === 'TCY'
                  ? [
                      {
                        hidden: true,
                        name: 'percentage',
                        type: 'number',
                        label: t('percentage'),
                        required: true,
                      },
                    ]
                  : [],
          })
        : [],
      schema: !isStakeableChain(chain)
        ? z.never()
        : match(chain, {
            THORChain: () =>
              coin.ticker === 'RUJI'
                ? z.object({
                    amount: z
                      .string()
                      .transform(Number)
                      .pipe(z.number().positive().max(totalAmountAvailable)),
                  })
                : coin.ticker === 'TCY'
                  ? z.discriminatedUnion('autoCompound', [
                      z.object({
                        autoCompound: z.literal(true),
                        amount: z
                          .number()
                          .transform(Number)
                          .pipe(
                            z.number().positive().max(totalAmountAvailable)
                          ),
                        percentage: z
                          .number()
                          .optional()
                          .pipe(
                            z
                              .number()
                              .positive()
                              .max(100, 'Percentage must be 0-100')
                          ),
                      }),
                      z.object({
                        autoCompound: z.literal(false),
                        percentage: z
                          .string()
                          .transform(Number)
                          .pipe(
                            z
                              .number()
                              .positive()
                              .max(100, 'Percentage must be 0-100')
                          ),
                      }),
                    ])
                  : z.never(),
            Ton: () =>
              z.object({
                validatorAddress: z.string().min(1, t('validator_address')),
                amount: z
                  .string()
                  .transform(Number)
                  .pipe(z.number().positive()),
              }) as any,
          }),
    }),
  })
}

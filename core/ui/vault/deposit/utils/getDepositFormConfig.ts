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
import {
  maxOrInfinity,
  positiveAmountSchema,
  toOptionalNumber,
  toRequiredNumber,
} from './validationHelpers'

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
        amount: positiveAmountSchema(totalAmountAvailable, t),
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
        amount: positiveAmountSchema(totalAmountAvailable, t),
        slippage: z.preprocess(toRequiredNumber, z.number().min(0.1).max(7.5)),
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
        amount: positiveAmountSchema(totalAmountAvailable, t),
      }),
    }),
    merge: () => ({
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
          label: 'Amount',
          required: true,
        },
      ],
      schema: z.object({
        nodeAddress: z
          .string()
          .min(1, 'Required')
          .refine(
            address =>
              isValidAddress({
                chain: chain as Chain,
                address,
                walletCore,
              }),
            {
              message: t('invalid_node_address'),
            }
          ),
        amount: positiveAmountSchema(totalAmountAvailable, t),
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
        amount: positiveAmountSchema(totalAmountAvailable, t),
        nodeAddress: z
          .string()
          .min(1, 'Required')
          .refine(
            address =>
              isValidAddress({
                chain: chain as Chain,
                address,
                walletCore,
              }),
            {
              message: t('invalid_node_address'),
            }
          ),
        thorchainAddress: z
          .string()
          .min(1, 'Required')
          .refine(
            address =>
              isValidAddress({
                chain: Chain.THORChain,
                address,
                walletCore,
              }),
            {
              message: t('invalid_node_address'),
            }
          ),
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
      schema: z
        .object({
          destinationChain: z.custom<Chain>(
            (val): val is Chain => Object.values(Chain).includes(val as Chain),
            { message: 'Destination Chain is required' }
          ),
          nodeAddress: z.string().min(1, 'Destination Address is required'),
          amount: positiveAmountSchema(
            totalAmountAvailable,
            t,
            t('chainFunctions.amountExceeded')
          ),
        })
        .superRefine((data, ctx) => {
          const { destinationChain, nodeAddress } = data
          if (
            !isValidAddress({
              chain: destinationChain as Chain,
              address: nodeAddress,
              walletCore,
            })
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t('send_invalid_receiver_address'),
              path: ['nodeAddress'],
            })
          }
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
        operatorFee: z.preprocess(toOptionalNumber, z.number().optional()),
        amount: positiveAmountSchema(totalAmountAvailable, t),
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
        // TODO: need to find out how to find the max amount of LP tokens
        lpUnits: z.preprocess(
          toRequiredNumber,
          z.number().gt(0, t('lp_units'))
          // .max(totalAmountAvailable, t('chainFunctions.amountExceeded'))
        ),
        amount: z.preprocess(
          toOptionalNumber,
          z
            .number()
            .gt(0, t('amount_must_be_positive'))
            .max(
              maxOrInfinity(totalAmountAvailable),
              t('chainFunctions.amountExceeded')
            )
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
        amount: positiveAmountSchema(totalAmountAvailable, t),
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
        // TODO: need to find out how to find the max amount of LP tokens
        lpUnits: z.preprocess(
          toRequiredNumber,
          z.number().gt(0, t('lp_units'))
          // .max(totalAmountAvailable, t('chainFunctions.amountExceeded'))
        ),
        bondableAsset: z.string().min(1, t('asset')),
        amount: z.preprocess(
          toOptionalNumber,
          z
            .number()
            .gt(0, t('amount_must_be_positive'))
            .max(
              maxOrInfinity(totalAmountAvailable),
              t('chainFunctions.amountExceeded')
            )
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
        amount: z.preprocess(
          toOptionalNumber,
          z
            .number()
            .max(
              maxOrInfinity(totalAmountAvailable),
              t('chainFunctions.amountExceeded')
            )
            .refine(val => val >= 0, {
              message: t('amount_must_be_non_negative'),
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
                    amount: positiveAmountSchema(totalAmountAvailable, t),
                  })
                : coin.ticker === 'TCY'
                  ? z.object({
                      amount: positiveAmountSchema(totalAmountAvailable, t),
                      autoCompound: z.boolean().optional(),
                    })
                  : z.never(),
            Ton: () =>
              z.object({
                amount: positiveAmountSchema(totalAmountAvailable, t),
                validatorAddress: z
                  .string()
                  .trim()
                  .min(1, t('validator_address'))
                  .refine(
                    address =>
                      isValidAddress({
                        chain: chain as Chain,
                        address,
                        walletCore,
                      }),
                    {
                      message: t('send_invalid_receiver_address'),
                    }
                  ),
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
                    amount: positiveAmountSchema(totalAmountAvailable, t),
                  })
                : coin.ticker === 'TCY'
                  ? z.discriminatedUnion('autoCompound', [
                      z.object({
                        autoCompound: z.literal(true),
                        amount: positiveAmountSchema(totalAmountAvailable, t),
                        percentage: z.preprocess(
                          toOptionalNumber,
                          z
                            .number()
                            .gt(0, t('percentage_limit'))
                            .max(100, t('percentage_limit'))
                            .optional()
                        ),
                      }),
                      z.object({
                        autoCompound: z.literal(false),
                        percentage: z.preprocess(
                          toRequiredNumber,
                          z
                            .number()
                            .gt(0, t('percentage_limit'))
                            .max(100, t('percentage_limit'))
                        ),
                      }),
                    ])
                  : z.never(),
            Ton: () =>
              z.object({
                validatorAddress: z
                  .string()
                  .trim()
                  .min(1, t('validator_address'))
                  .refine(
                    address =>
                      isValidAddress({
                        chain: chain as Chain,
                        address,
                        walletCore,
                      }),
                    {
                      message: t('send_invalid_receiver_address'),
                    }
                  ),
                amount: positiveAmountSchema(totalAmountAvailable, t),
              }) as any,
          }),
    }),
    freeze: () => ({
      fields: [
        {
          name: 'amount',
          type: 'number',
          label: t('amount'),
          required: true,
        },
      ],
      schema: z.object({
        resourceType: z.enum(['BANDWIDTH', 'ENERGY']),
        amount: positiveAmountSchema(totalAmountAvailable, t),
      }),
    }),
    unfreeze: () => ({
      fields: [
        {
          name: 'amount',
          type: 'number',
          label: t('amount'),
          required: true,
        },
      ],
      schema: z.object({
        resourceType: z.enum(['BANDWIDTH', 'ENERGY']),
        amount: positiveAmountSchema(totalAmountAvailable, t),
      }),
    }),
    add_cacao_pool: () => ({
      fields: [
        {
          name: 'amount',
          type: 'number',
          label: t('amount'),
          required: true,
        },
      ],
      schema: z.object({
        amount: positiveAmountSchema(totalAmountAvailable, t),
      }),
    }),
    remove_cacao_pool: () => ({
      fields: [
        {
          name: 'percentage',
          type: 'number',
          label: t('percentage'),
          required: true,
        },
      ],
      schema: z.object({
        percentage: z.preprocess(
          toRequiredNumber,
          z
            .number()
            .gt(0, t('amount_must_be_positive'))
            .max(100, t('percentage_limit'))
        ),
      }),
    }),
    add_thor_lp: () => ({
      fields: [
        {
          name: 'amount',
          type: 'number',
          label: t('amount'),
          required: true,
        },
      ],
      schema: z.object({
        amount: positiveAmountSchema(totalAmountAvailable, t),
        pool: z.string().min(1),
        pairedAddress: z.string().optional(),
      }),
    }),
    remove_thor_lp: () => ({
      fields: [
        {
          name: 'percentage',
          type: 'number',
          label: t('percentage'),
          required: true,
        },
      ],
      schema: z.object({
        percentage: z.preprocess(
          toRequiredNumber,
          z
            .number()
            .gt(0, t('amount_must_be_positive'))
            .max(100, t('percentage_limit'))
        ),
        pool: z.string().min(1),
      }),
    }),
  })
}

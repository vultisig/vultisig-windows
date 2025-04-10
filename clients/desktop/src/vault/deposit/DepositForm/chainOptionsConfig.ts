import { Chain } from '@core/chain/Chain'
import { WalletCore } from '@trustwallet/wallet-core'
import type { TFunction } from 'i18next'
import { z } from 'zod'

import { isValidAddress } from '../../../chain/utils/isValidAddress'

export const getRequiredFieldsPerChainAction = (t: TFunction) => ({
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
        label: 'chainFunctions.bond_with_lp.labels.nodeAddress',
        required: true,
      },
      {
        name: 'lpUnits',
        type: 'number',
        label: 'chainFunctions.bond_with_lp.labels.lpUnits',
        required: true,
      },
      {
        name: 'amount',
        type: 'number',
        label: 'chainFunctions.bond_with_lp.labels.amount',
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
        label: 'chainFunctions.unbond.labels.nodeAddress',
        required: true,
      },
      {
        name: 'amount',
        type: 'number',
        label: 'chainFunctions.unbond.labels.amount',
        required: true,
      },
      {
        name: 'provider',
        type: 'text',
        label: 'chainFunctions.unbond.labels.provider',
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
        label: 'chainFunctions.unbond_with_lp.labels.nodeAddress',
        required: true,
      },
      {
        name: 'lpUnits',
        type: 'number',
        label: 'chainFunctions.unbond_with_lp.labels.lpUnits',
        required: true,
      },
      {
        name: 'amount',
        type: 'number',
        label: 'chainFunctions.unbond_with_lp.labels.amount',
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
        label: 'chainFunctions.leave.labels.nodeAddress',
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
        label: 'chainFunctions.custom.labels.amount',
        required: false,
      },
      {
        name: 'customMemo',
        type: 'text',
        label: 'chainFunctions.custom.labels.customMemo',
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
    fields: [
      {
        name: 'amount',
        type: 'number',
        label: 'chainFunctions.stake.labels.amount',
        required: true,
      },
      {
        name: 'validatorAddress',
        type: 'text',
        label: 'chainFunctions.stake.labels.validatorAddress',
        required: true,
      },
    ],
    schema: (
      _chain: Chain,
      _walletCore: WalletCore,
      _totalAmountAvailable: number
    ) =>
      z.object({
        amount: z
          .string()
          .transform(val => Number(val))
          .pipe(z.number().positive().min(0.01, t('amount'))),
        validatorAddress: z.string().min(1, t('validator_address')),
      }),
  },
  unstake: {
    fields: [
      {
        name: 'validatorAddress',
        type: 'text',
        label: 'chainFunctions.unstake.labels.validatorAddress',
        required: true,
      },
    ],
    schema: (
      _chain: Chain,
      _walletCore: WalletCore,
      _totalAmountAvailable: number
    ) =>
      z.object({
        validatorAddress: z.string().min(1, t('validator_address')),
      }),
  },
})

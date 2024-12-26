import { WalletCore } from '@trustwallet/wallet-core';
import { z } from 'zod';

import { getCoinType } from '../../../chain/walletCore/getCoinType';
import { Chain } from '../../../model/chain';

export type ChainWithAction = keyof typeof chainDepositOptionsConfig;

export const chainDepositOptionsConfig = {
  thorchain: ['bond', 'unbond', 'leave', 'addPool', 'withdrawPool', 'custom'],
  mayachain: [
    'bond',
    'unbond',
    'bond_with_lp',
    'unbond_with_lp',
    'leave',
    'custom',
  ],
  dydx: ['vote'],
  ton: ['stake', 'unstake'],
};

export type ChainAction = keyof typeof requiredFieldsPerChainAction;
export const requiredFieldsPerChainAction = {
  bond: {
    fields: [
      {
        name: 'nodeAddress',
        type: 'text',
        label: 'chainFunctions.bond.labels.nodeAddress',
        required: true,
      },
      {
        name: 'provider',
        type: 'text',
        label: 'chainFunctions.bond.labels.provider',
        required: false,
      },
      {
        name: 'operatorFee',
        type: 'number',
        label: 'chainFunctions.bond.labels.operatorFee',
        required: false,
      },
      {
        name: 'amount',
        type: 'number',
        label: 'chainFunctions.bond.labels.amount',
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
            message: 'chainFunctions.bond.validations.nodeAddressMinLength',
          })
          .refine(
            async address => {
              const coinType = getCoinType({
                walletCore,
                chain: chain as Chain,
              });

              return walletCore.AnyAddress.isValid(address, coinType);
            },
            {
              message: 'chainFunctions.bond.validations.nodeAddressInvalid',
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
              .min(0.01, 'chainFunctions.bond.validations.amount')
              .max(totalAmountAvailable, 'chainFunctions.amountExceeded')
              .refine(val => val > 0, {
                message: 'chainFunctions.bond.validations.amount',
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
            message: 'chainFunctions.bond.validations.nodeAddressMinLength',
          })
          .refine(
            async address => {
              const coinType = getCoinType({
                walletCore,
                chain: chain as Chain,
              });

              return walletCore.AnyAddress.isValid(address, coinType);
            },
            {
              message: 'chainFunctions.bond.validations.nodeAddressInvalid',
            }
          ),
        bondableAsset: z
          .string()
          .min(1, 'chainFunctions.unbond_with_lp.validations.bondableAsset'),
        lpUnits: z
          .string()
          .optional()
          .transform(val => Number(val))
          .pipe(
            z
              .number()
              .positive()
              .min(0.01, 'chainFunctions.bond.validations.lpUnits')
              // TODO: need to find out how to find the max amount of LP tokens
              // .max(totalAmountAvailable, 'chainFunctions.amountExceeded')
              .refine(val => val > 0, {
                message: 'chainFunctions.bond.validations.lpUnits',
              })
          ),
        amount: z
          .string()
          .optional()
          .transform(val => {
            if (val === undefined || val === '') return undefined;
            return Number(val);
          })
          .pipe(
            z
              .number()
              .positive()
              .min(0.01, 'chainFunctions.bond.validations.amount')
              .max(totalAmountAvailable, 'chainFunctions.amountExceeded')
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
      totalAmountAvailable: number
    ) =>
      z.object({
        nodeAddress: z
          .string()
          .refine(address => address.length > 0, {
            message: 'chainFunctions.bond.validations.nodeAddressMinLength',
          })
          .refine(
            async address => {
              const coinType = getCoinType({
                walletCore,
                chain: chain as Chain,
              });

              return walletCore.AnyAddress.isValid(address, coinType);
            },
            {
              message: 'chainFunctions.bond.validations.nodeAddressInvalid',
            }
          ),
        amount: z
          .string()
          .transform(val => Number(val))
          .pipe(
            z
              .number()
              .positive()
              .max(totalAmountAvailable, 'chainFunctions.amountExceeded')
              .min(0.01, 'chainFunctions.unbond.validations.amount')
              .refine(val => val > 0, {
                message: 'chainFunctions.unbond.validations.amount',
              })
          ),
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
            message: 'chainFunctions.bond.validations.nodeAddressMinLength',
          })
          .refine(
            async address => {
              const coinType = getCoinType({
                walletCore,
                chain: chain as Chain,
              });

              return walletCore.AnyAddress.isValid(address, coinType);
            },
            {
              message: 'chainFunctions.bond.validations.nodeAddressInvalid',
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
              .min(0.01, 'chainFunctions.bond.validations.lpUnits')
              // TODO: need to find out how to find the max amount of LP tokens
              // .max(totalAmountAvailable, 'chainFunctions.amountExceeded')
              .refine(val => val > 0, {
                message: 'chainFunctions.bond.validations.lpUnits',
              })
          ),
        bondableAsset: z
          .string()
          .min(1, 'chainFunctions.bond_with_lp.validations.bondableAsset'),
        amount: z
          .string()
          .optional()
          .transform(val => {
            if (val === undefined || val === '') return undefined;
            return Number(val);
          })
          .pipe(
            z
              .number()
              .positive()
              .min(0.01, 'chainFunctions.bond.validations.amount')
              .max(totalAmountAvailable, 'chainFunctions.amountExceeded')
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
    schema: (chain: Chain, walletCore: WalletCore) =>
      z.object({
        nodeAddress: z
          .string()
          .refine(address => address.length > 0, {
            message: 'chainFunctions.leave.validations.nodeAddressMinLength',
          })
          .refine(
            async address => {
              const coinType = getCoinType({
                walletCore,
                chain: chain as Chain,
              });

              return walletCore.AnyAddress.isValid(address, coinType);
            },
            {
              message: 'chainFunctions.leave.validations.nodeAddressInvalid',
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
        required: true,
      },
      {
        name: 'customMemo',
        type: 'text',
        label: 'chainFunctions.custom.labels.customMemo',
        required: true,
      },
    ],
    schema: (
      chain: Chain,
      walletCore: WalletCore,
      totalAmountAvailable: number
    ) =>
      z.object({
        amount: z
          .string()
          .transform(val => Number(val))
          .pipe(
            z
              .number()
              .positive()
              .max(totalAmountAvailable, 'chainFunctions.amountExceeded')
              .min(0.01, 'chainFunctions.custom.validations.amount')
              .refine(val => val > 0, {
                message: 'chainFunctions.custom.validations.amount',
              })
          ),
        customMemo: z
          .string()
          .min(1, 'chainFunctions.custom.validations.customMemo'),
      }),
  },
  addPool: {
    fields: [
      {
        name: 'amount',
        type: 'number',
        label: 'chainFunctions.addPool.labels.amount',
        required: true,
      },
    ],
    schema: (chain: Chain, walletCore: any, totalAmountAvailable: number) =>
      z.object({
        amount: z
          .string()
          .transform(val => Number(val))
          .pipe(
            z
              .number()
              .positive()
              .max(totalAmountAvailable, 'chainFunctions.amountExceeded')
              .min(0.01, 'chainFunctions.addPool.validations.amount')
              .refine(val => val > 0, {
                message: 'chainFunctions.addPool.validations.amount',
              })
          ),
      }),
  },
  withdrawPool: {
    fields: [
      {
        name: 'affiliateFee',
        type: 'number',
        label: 'chainFunctions.withdrawPool.labels.affiliateFee',
        required: false,
      },
      {
        name: 'percentage',
        type: 'number',
        label: 'chainFunctions.withdrawPool.labels.percentage',
        required: true,
      },
    ],
    schema: z.object({
      affiliateFee: z
        .string()
        .optional()
        .transform(val => (val ? Number(val) : undefined))
        .pipe(z.number().optional()),
      percentage: z
        .string()
        .transform(val => Number(val))
        .pipe(
          z
            .number()
            .min(0)
            .max(100)
            .refine(val => val >= 0 && val <= 100, {
              message: 'chainFunctions.withdrawPool.validations.percentage',
            })
        ),
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
    schema: z.object({
      proposalId: z
        .string()
        .min(1, 'chainFunctions.vote.validations.proposalId'),
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
    schema: z.object({
      amount: z
        .string()
        .transform(val => Number(val))
        .pipe(
          z
            .number()
            .positive()
            .min(0.01, 'chainFunctions.stake.validations.amount')
        ),
      validatorAddress: z
        .string()
        .min(1, 'chainFunctions.stake.validations.validatorAddress'),
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
    schema: z.object({
      validatorAddress: z
        .string()
        .min(1, 'chainFunctions.unstake.validations.validatorAddress'),
    }),
  },
};

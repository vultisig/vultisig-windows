import { z } from 'zod';

export type ChainWithAction = keyof typeof chainActionOptionsConfig;

export const chainActionOptionsConfig = {
  thorchain: ['bond', 'unbond', 'leave', 'addPool', 'withdrawPool', 'custom'],
  mayachain: ['bond', 'unbond', 'leave', 'custom'],
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
    schema: z.object({
      nodeAddress: z
        .string()
        .min(1, 'chainFunctions.bond.validations.nodeAddress'),
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
            .min(1, 'chainFunctions.bond.validations.amount')
            .refine(val => val > 0, {
              message: 'Amount must be greater than zero',
            })
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
    schema: z.object({
      nodeAddress: z
        .string()
        .min(1, 'chainFunctions.unbond.validations.nodeAddress'),
      amount: z
        .string()
        .transform(val => Number(val))
        .pipe(
          z
            .number()
            .positive()
            .min(1, 'chainFunctions.unbond.validations.amount')
            .refine(val => val > 0, {
              message: 'Amount must be greater than zero',
            })
        ),
      provider: z.string().optional(),
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
    schema: z.object({
      nodeAddress: z
        .string()
        .min(1, 'chainFunctions.leave.validations.nodeAddress'),
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
    schema: z.object({
      amount: z
        .string()
        .transform(val => Number(val))
        .pipe(
          z
            .number()
            .positive()
            .min(1, 'chainFunctions.custom.validations.amount')
            .refine(val => val > 0, {
              message: 'Amount must be greater than zero',
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
    schema: z.object({
      amount: z
        .string()
        .transform(val => Number(val))
        .pipe(
          z
            .number()
            .positive()
            .min(1, 'chainFunctions.addPool.validations.amount')
            .refine(val => val > 0, {
              message: 'Amount must be greater than zero',
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
};

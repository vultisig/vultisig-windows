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
      operatorFee: z.number().optional(),
      amount: z.number().positive('chainFunctions.bond.validations.amount'),
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
      amount: z.number().positive('chainFunctions.unbond.validations.amount'),
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
        .nonempty('chainFunctions.leave.validations.nodeAddress'),
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
      amount: z.number().positive('chainFunctions.custom.validations.amount'),
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
      amount: z.number().positive('chainFunctions.addPool.validations.amount'),
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
      affiliateFee: z.number().optional(),
      percentage: z
        .number()
        .min(0)
        .max(100)
        .nonnegative('chainFunctions.withdrawPool.validations.percentage'),
    }),
  },
};

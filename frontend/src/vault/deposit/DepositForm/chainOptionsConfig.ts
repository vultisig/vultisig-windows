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
        label: 'Node Address',
        required: true,
      },
      { name: 'provider', type: 'text', label: 'Provider', required: false },
      {
        name: 'operatorFee',
        type: 'number',
        label: "Operator's Fee",
        required: false,
      },
      { name: 'amount', type: 'number', label: 'Amount', required: true },
    ],
    schema: z.object({
      nodeAddress: z.string().nonempty('Node Address is required'),
      provider: z.string().optional(),
      operatorFee: z.number().optional(),
      amount: z.number().positive('Amount must be positive'),
    }),
  },
  unbond: {
    fields: [
      {
        name: 'nodeAddress',
        type: 'text',
        label: 'Node Address',
        required: true,
      },
      { name: 'amount', type: 'number', label: 'Amount', required: true },
      { name: 'provider', type: 'text', label: 'Provider', required: false },
    ],
    schema: z.object({
      nodeAddress: z.string().nonempty('Node Address is required'),
      amount: z.number().positive('Amount must be positive'),
      provider: z.string().optional(),
    }),
  },
  leave: {
    fields: [
      {
        name: 'nodeAddress',
        type: 'text',
        label: 'Node Address',
        required: true,
      },
    ],
    schema: z.object({
      nodeAddress: z.string().nonempty('Node Address is required'),
    }),
  },
  custom: {
    fields: [
      { name: 'amount', type: 'number', label: 'Amount', required: true },
      {
        name: 'customMemo',
        type: 'text',
        label: 'Custom Memo',
        required: true,
      },
    ],
    schema: z.object({
      amount: z.number().positive('Amount must be positive'),
      customMemo: z.string().nonempty('Custom Memo is required'),
    }),
  },
  addPool: {
    fields: [
      { name: 'amount', type: 'number', label: 'Amount', required: true },
    ],
    schema: z.object({
      amount: z.number().positive('Amount must be positive'),
    }),
  },
  withdrawPool: {
    fields: [
      {
        name: 'affiliateFee',
        type: 'number',
        label: "Affiliate's Fee",
        required: false,
      },
      {
        name: 'percentage',
        type: 'number',
        label: 'Percentage',
        required: true,
      },
    ],
    schema: z.object({
      affiliateFee: z.number().optional(),
      percentage: z
        .number()
        .min(0)
        .max(100)
        .nonnegative('Percentage is required and must be between 0 and 100'),
    }),
  },
};

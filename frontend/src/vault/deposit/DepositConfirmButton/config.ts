import { ChainAction } from '../DepositForm/chainOptionsConfig';

type TransactionConfig = {
  requiresAmount?: boolean;
  requiresNodeAddress?: boolean;
  requiresMemo?: boolean;
  defaultAmount?: number;
  defaultMemo?: string;
};

export const transactionConfig: Record<ChainAction, TransactionConfig> = {
  bond: { requiresAmount: true, requiresNodeAddress: true },
  unbond: { requiresAmount: true, requiresNodeAddress: true },
  leave: { requiresNodeAddress: true, defaultAmount: 1e-8 },
  custom: { requiresAmount: true, requiresMemo: true },
  addPool: { requiresAmount: true },
  withdrawPool: { requiresMemo: true },
  stake: { requiresAmount: true, requiresNodeAddress: true },
  unstake: { requiresAmount: true, requiresNodeAddress: true },
  vote: { requiresAmount: false, requiresNodeAddress: false },
};

import { Chain } from '../../model/chain';
import { DepositEnabledChain } from './DepositEnabledChain';

export const chainActions = [
  'bond',
  'unbond',
  'leave',
  'custom',
  'bond_with_lp',
  'unbond_with_lp',
  'vote',
  'stake',
  'unstake',
] as const;

export type ChainAction = (typeof chainActions)[number];

export const chainActionsRecord: Record<DepositEnabledChain, ChainAction[]> = {
  [Chain.THORChain]: [
    'bond',
    'unbond',
    'leave',
    'custom',
  ],
  [Chain.MayaChain]: ['bond_with_lp', 'unbond_with_lp', 'leave', 'custom'],
  [Chain.Dydx]: ['vote'],
  [Chain.Ton]: ['stake', 'unstake'],
};

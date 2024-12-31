import { Chain } from '../../model/chain';

export const depositEnabledChains = [
  Chain.THORChain,
  Chain.MayaChain,
  Chain.Dydx,
  Chain.Ton,
] as const;

export type DepositEnabledChain = (typeof depositEnabledChains)[number];

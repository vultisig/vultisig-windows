import { FeePriority } from '../../fee/FeePriority';

export type EvmFeeSettings = {
  priority: FeePriority;
  gasLimit: number;
};

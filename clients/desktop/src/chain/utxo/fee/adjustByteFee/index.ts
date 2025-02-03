import { byteFeeMultiplier, UtxoFeeSettings } from '../UtxoFeeSettings';

export const adjustByteFee = (
  byteFee: number,
  { priority }: UtxoFeeSettings
) => {
  if (typeof priority === 'number') {
    return priority;
  }

  const multiplier = byteFeeMultiplier[priority];

  return Math.ceil(byteFee * multiplier);
};

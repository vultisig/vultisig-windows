import { describe, expect, it } from 'vitest';

import { byteFeeMultiplier, UtxoFeeSettings } from '../UtxoFeeSettings';
import { adjustByteFee } from '.';

describe('adjustByteFee', () => {
  it('returns priority value when priority is a number', () => {
    const byteFee = 100;
    const feeSettings: UtxoFeeSettings = { priority: 200 };

    const result = adjustByteFee(byteFee, feeSettings);

    expect(result).toBe(200);
  });

  it('calculates fee using byteFeeMultiplier when priority is not a number', () => {
    const byteFee = 100;
    const feeSettings: UtxoFeeSettings = { priority: 'fast' };
    byteFeeMultiplier['fast'] = 2.5;

    const result = adjustByteFee(byteFee, feeSettings);

    expect(result).toBe(250);
  });

  it('returns ceiling value of the calculated fee', () => {
    const byteFee = 150.5;
    const feeSettings: UtxoFeeSettings = { priority: 'normal' };
    byteFeeMultiplier['normal'] = 1;

    const result = adjustByteFee(byteFee, feeSettings);

    expect(result).toBe(151);
  });
});

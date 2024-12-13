import { describe, expect, it, vi } from 'vitest';

import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { calculateFromChainToHumanReadableAmount } from '.';

vi.mock('../../../chain/utils/fromChainAmount', () => ({
  fromChainAmount: vi.fn(),
}));

describe('calculateFromChainToHumanReadableAmount', () => {
  it('should call fromChainAmount with BigInt(amount) and decimals', () => {
    const mockedFromChainAmount = fromChainAmount as ReturnType<typeof vi.fn>;

    const testCases = [
      { amount: 1000, decimals: 2 },
      { amount: '1000', decimals: 4 },
      { amount: 123456789123456789n, decimals: 8 },
    ];

    testCases.forEach(({ amount, decimals }) => {
      calculateFromChainToHumanReadableAmount({ amount, decimals });

      expect(mockedFromChainAmount).toHaveBeenCalledWith(
        BigInt(amount),
        decimals
      );
    });
  });

  it('should handle various input types for amount', () => {
    const mockedFromChainAmount = fromChainAmount as ReturnType<typeof vi.fn>;

    const testAmount = 1000;
    const decimals = 2;
    mockedFromChainAmount.mockReturnValue('10.00');

    const result = calculateFromChainToHumanReadableAmount({
      amount: testAmount,
      decimals,
    });

    expect(result).toBe('10.00');
    expect(mockedFromChainAmount).toHaveBeenCalledWith(
      BigInt(testAmount),
      decimals
    );
  });
});

import { isOneOf } from '@lib/utils/array/isOneOf';
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent';
import { Chain } from '../../model/chain';

export const assertChainField = <C extends Chain, T extends { chain?: string }>(
  input: T
): T & { chain: C } => {
  const chain = isOneOf(shouldBePresent(input.chain), Object.values(Chain));

  if (!chain) {
    throw new Error(`Invalid chain value: ${input.chain}`);
  }

  return { ...input, chain: chain as C };
};

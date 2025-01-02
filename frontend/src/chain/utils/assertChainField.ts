import { isOneOf } from '../../lib/utils/array/isOneOf';
import { Chain } from '../../model/chain';

export const assertChainField = <T extends { chain?: string }>(
  input: T
): T & { chain: Chain } => {
  if (!input.chain) {
    throw new Error("The 'chain' field is missing or undefined.");
  }

  const chain = isOneOf(input.chain, Object.values(Chain));

  if (!chain) {
    throw new Error(`Invalid chain value: ${input.chain}`);
  }

  return { ...input, chain };
};

import { isOneOf } from '../../lib/utils/array/isOneOf';
import { Chain } from '../../model/chain';
import { ChainEntity } from '../ChainEntity';

type HasChain = {
  chain: string;
};

export function enforceChain<T extends HasChain>(input: T): T & ChainEntity {
  const chain = isOneOf(input.chain, Object.values(Chain));

  return {
    ...input,
    chain,
  };
}

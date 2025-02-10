import { Chain } from '@core/chain/Chain';
import { ChainEntity } from '@core/chain/ChainEntity';
import { isOneOf } from '@lib/utils/array/isOneOf';

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

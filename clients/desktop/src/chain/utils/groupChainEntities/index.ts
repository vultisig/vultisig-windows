import { groupItems } from '@lib/utils/array/groupItems';
import { ChainEntity } from '../../ChainEntity';

export const groupChainEntities = <T extends ChainEntity>(items: T[]) => {
  return groupItems(items, item => item.chain);
};

import { ChainEntity } from '@core/chain/ChainEntity'
import { groupItems } from '@lib/utils/array/groupItems'

export const groupChainEntities = <T extends ChainEntity>(items: T[]) => {
  return groupItems(items, item => item.chain)
}

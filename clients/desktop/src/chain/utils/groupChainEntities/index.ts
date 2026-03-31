import { ChainEntity } from '@vultisig/core-chain/ChainEntity'
import { groupItems } from '@vultisig/lib-utils/array/groupItems'

export const groupChainEntities = <T extends ChainEntity>(items: T[]) => {
  return groupItems(items, item => item.chain)
}

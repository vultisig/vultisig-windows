import { Chain } from '@core/chain/Chain'

export type ChainEntity<T extends Chain = Chain> = {
  chain: T
}

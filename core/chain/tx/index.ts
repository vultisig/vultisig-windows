import { Chain } from '../Chain'
import { DecodedTx } from './decode'

export type Tx<T extends Chain = Chain> = DecodedTx<T> & {
  hash: string
}

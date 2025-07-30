import { Chain } from '../../Chain'
import { DecodedTx } from '../decode'

export type GetTxHashResolver<T extends Chain = Chain> = (
  tx: DecodedTx<T>
) => string

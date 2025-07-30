import { Chain } from '../../Chain'
import { DecodedTx } from '../decode'

export type TxHashResolver<T extends Chain = Chain> = (
  tx: DecodedTx<T>
) => string

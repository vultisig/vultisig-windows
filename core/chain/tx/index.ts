import { Chain } from '../Chain'
import { SigningOutput } from '../tw/signingOutput'

export type Tx<T extends Chain = Chain> = {
  hash: string
  data: SigningOutput<T>
}

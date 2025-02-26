import { Chain } from '@core/chain/Chain'

export type AddressBookItem = {
  id: string
  address: string
  chain: Chain
  title: string
  order: number
}

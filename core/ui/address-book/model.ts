import { Chain } from '@core/chain/Chain'

export type AddressBookItem = {
  address: string
  chain: Chain
  id: string
  order: number
  title: string
}

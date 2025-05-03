import { queryUrl } from '@lib/utils/query/queryUrl'

const THORCHAIN_INBOUND_ADDRESS_API =
  'https://thornode.ninerealms.com/thorchain/inbound_addresses'

export const getThorchainInboundAddress = (): Promise<string> =>
  queryUrl(THORCHAIN_INBOUND_ADDRESS_API)

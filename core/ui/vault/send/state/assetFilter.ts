import { setupStateProvider } from '@lib/ui/state/setupStateProvider'

import { SendChainFilter } from '../steps/asset/getSendAssetListing'

type SendAssetFilter = {
  chain: SendChainFilter
  query: string
  /** The "Select chains" page is open over the asset step. */
  isPickingChain: boolean
  /** Focus returns to the chain filter button once the page closes. */
  focusesChainFilter: boolean
}

/**
 * The asset step's chain filter and search, kept above the step so they
 * survive moving between steps and opening the "Select chains" page.
 */
export const [SendAssetFilterProvider, useSendAssetFilter] =
  setupStateProvider<SendAssetFilter>('SendAssetFilter', {
    chain: null,
    query: '',
    isPickingChain: false,
    focusesChainFilter: false,
  })

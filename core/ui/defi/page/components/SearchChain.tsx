import { ExpandableSearch } from '@core/ui/components/ExpandableSearch'
import { useSearchChain } from '@core/ui/defi/page/components/state/searchChainProvider'

type SearchChainProps = {
  onOpenChange?: (isOpen: boolean) => void
  isFullWidth?: boolean
}

/** Earn page chains search, bound to the DeFi chain search query provider. */
export const SearchChain = (props: SearchChainProps) => {
  const [searchQuery, setSearchQuery] = useSearchChain()

  return (
    <ExpandableSearch
      data-testid="defi-chain-search-button"
      query={searchQuery}
      onQueryChange={setSearchQuery}
      {...props}
    />
  )
}

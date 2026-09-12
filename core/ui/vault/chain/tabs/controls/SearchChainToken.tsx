import { ExpandableSearch } from '@core/ui/components/ExpandableSearch'
import { useSearchChainToken } from '@core/ui/vault/chain/state/searchChainTokenProvider'

type SearchChainTokenProps = {
  onOpenChange?: (isOpen: boolean) => void
  isFullWidth?: boolean
}

/** Chain page tokens search, bound to the chain token search query provider. */
export const SearchChainToken = (props: SearchChainTokenProps) => {
  const [searchQuery, setSearchQuery] = useSearchChainToken()

  return (
    <ExpandableSearch
      data-testid="vault-chain-token-search-toggle"
      query={searchQuery}
      onQueryChange={setSearchQuery}
      {...props}
    />
  )
}

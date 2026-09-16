import { ExpandableSearch } from '@core/ui/components/ExpandableSearch'
import { useSearchChain } from '@core/ui/vault/page/state/searchChainProvider'

type SearchChainProps = {
  onOpenChange?: (isOpen: boolean) => void
  isFullWidth?: boolean
}

/** Vault page chains search, bound to the chain search query provider. */
export const SearchChain = (props: SearchChainProps) => {
  const [searchQuery, setSearchQuery] = useSearchChain()

  return (
    <ExpandableSearch
      data-testid="vault-chain-search-button"
      query={searchQuery}
      onQueryChange={setSearchQuery}
      {...props}
    />
  )
}

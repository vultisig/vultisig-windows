import { DefiChainBalanceBanner as Banner } from './banners'
import { useCurrentDefiChain } from './useCurrentDefiChain'

export const DefiChainBalanceBanner = () => {
  const chain = useCurrentDefiChain()

  return <Banner chain={chain} />
}

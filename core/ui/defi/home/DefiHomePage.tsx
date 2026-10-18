import { DefiPortfolioList } from '@core/ui/defi/page/components/DefiPortfolioList'
import { useCore } from '@core/ui/state/core'
import { HomeHeaderSlot } from '@core/ui/vault/home/HomeHeaderSlot'
import { HomePageContent } from '@core/ui/vault/home/HomePageContent'
import { useHomePageScrollRef } from '@core/ui/vault/home/useHomePageScrollRef'

/** The home's DeFi page: the room for the shared header, then positions. */
export const DefiHomePage = () => {
  const { client } = useCore()
  const scrollRef = useHomePageScrollRef('defi')

  return (
    <HomePageContent
      ref={scrollRef}
      $isExtension={client === 'extension'}
      scrollable
      gap={24}
      flexGrow
      data-testid="defi-page"
    >
      <HomeHeaderSlot />
      <DefiPortfolioList />
    </HomePageContent>
  )
}

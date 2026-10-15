import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCore } from '@core/ui/state/core'
import { pageBottomInsetVar } from '@lib/ui/page/PageContent'
import { MotionValue } from 'framer-motion'
import { useEffect } from 'react'

import { useNavigateToHomeTab } from '../home/homeTab'
import { AgentBottomNavigationContent } from './AgentBottomNavigationContent'

const bottomNavigationHeight = 66

type BottomNavigationProps = {
  activeTab?: 'wallet' | 'defi' | 'agent'
  isActiveTabRoot?: boolean
  /** The home pager's live position, so the pill follows a swipe. */
  indicator?: MotionValue<number>
}

export const BottomNavigation = ({
  activeTab = 'wallet',
  isActiveTabRoot = true,
  indicator,
}: BottomNavigationProps) => {
  const { client } = useCore()
  const navigate = useCoreNavigate()
  const navigateToHomeTab = useNavigateToHomeTab()

  useEffect(() => {
    if (typeof document === 'undefined') return

    const root = document.documentElement
    const previousValue = root.style.getPropertyValue(pageBottomInsetVar)

    root.style.setProperty(pageBottomInsetVar, `${bottomNavigationHeight}px`)

    return () => {
      if (previousValue) {
        root.style.setProperty(pageBottomInsetVar, previousValue)
      } else {
        root.style.removeProperty(pageBottomInsetVar)
      }
    }
  }, [])

  const handleTabChange = (tab: 'wallet' | 'defi') => {
    if (tab === activeTab && isActiveTabRoot) return

    navigateToHomeTab(tab)
  }

  return (
    <AgentBottomNavigationContent
      activeTab={activeTab}
      indicator={indicator}
      isExtension={client === 'extension'}
      onTabChange={handleTabChange}
      onCameraPress={() => navigate({ id: 'uploadQr', state: {} })}
    />
  )
}

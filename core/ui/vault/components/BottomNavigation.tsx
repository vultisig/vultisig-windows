import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { pageBottomInsetVar } from '@lib/ui/page/PageContent'
import { useEffect } from 'react'

import { AgentBottomNavigationContent } from './AgentBottomNavigationContent'

const bottomNavigationHeight = 66

type BottomNavigationProps = {
  activeTab?: 'wallet' | 'defi' | 'agent'
  isActiveTabRoot?: boolean
}

export const BottomNavigation = ({
  activeTab = 'wallet',
  isActiveTabRoot = true,
}: BottomNavigationProps) => {
  const navigate = useCoreNavigate()

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

    if (tab === 'wallet') {
      navigate({ id: 'vault' }, { replace: true })
    } else if (tab === 'defi') {
      navigate({ id: 'defi', state: {} }, { replace: true })
    }
  }

  return (
    <AgentBottomNavigationContent
      activeTab={activeTab}
      onTabChange={handleTabChange}
      onCameraPress={() => navigate({ id: 'uploadQr', state: {} })}
    />
  )
}

import {
  useHasSeenHomeSwipeHintQuery,
  useMarkHomeSwipeHintSeen,
} from '@core/ui/storage/hasSeenHomeSwipeHint'
import { useHasSeenNotificationPrompt } from '@core/ui/storage/hasSeenNotificationPrompt'
import { useEffect, useRef, useState } from 'react'

import { HomeSwipeHintOverlay } from './HomeSwipeHintOverlay'
import { HomeTab, homeTabs, useNavigateToHomeTab } from './homeTab'

type HomeSwipeHintProps = {
  tab: HomeTab
}

/**
 * One-time hint that the Wallet and DeFi tabs switch by swiping, shown once
 * the notification prompt is out of the way. Got it, a click on the dim, a
 * swipe on the dim (which also switches) or any tab switch dismisses it for
 * good.
 */
export const HomeSwipeHint = ({ tab }: HomeSwipeHintProps) => {
  const { data: hasSeen } = useHasSeenHomeSwipeHintQuery()
  const [hasSeenNotificationPrompt] = useHasSeenNotificationPrompt()
  const markSeen = useMarkHomeSwipeHintSeen()
  const navigateToTab = useNavigateToHomeTab()
  const [isDismissed, setIsDismissed] = useState(false)
  const initialTabRef = useRef(tab)

  const isShown = hasSeen === false && hasSeenNotificationPrompt && !isDismissed

  const dismiss = () => {
    setIsDismissed(true)
    markSeen()
  }

  useEffect(() => {
    if (isShown && tab !== initialTabRef.current) {
      setIsDismissed(true)
      markSeen()
    }
  }, [isShown, tab, markSeen])

  if (!isShown) return null

  return (
    <HomeSwipeHintOverlay
      onDismiss={dismiss}
      onSwipe={direction => {
        const nextTab = homeTabs[homeTabs.indexOf(tab) + direction]
        if (nextTab) navigateToTab(nextTab)
        dismiss()
      }}
    />
  )
}

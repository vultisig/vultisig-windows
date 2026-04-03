import { ChildrenProp } from '@lib/ui/props'
import { createContextHook } from '@lib/ui/state/createContextHook'
import { createContext, useState } from 'react'

import { NotificationBanner } from './NotificationBanner'

/** Payload shown in {@link NotificationBanner}. */
type NotificationBannerData = {
  title: string
  subtitle: string
  onAction: () => void
}

/** Context API for controlling the global notification banner. */
type NotificationBannerContextValue = {
  showBanner: (data: NotificationBannerData) => void
  dismissBanner: () => void
}

const NotificationBannerContext = createContext<
  NotificationBannerContextValue | undefined
>(undefined)

/** Root provider for in-app notification banners (show / dismiss from anywhere). */
export const NotificationBannerProvider = ({ children }: ChildrenProp) => {
  const [bannerData, setBannerData] = useState<NotificationBannerData | null>(
    null
  )
  const [showCount, setShowCount] = useState(0)

  const showBanner = (data: NotificationBannerData) => {
    setBannerData(data)
    setShowCount(c => c + 1)
  }

  const dismissBanner = () => {
    setBannerData(null)
  }

  return (
    <NotificationBannerContext.Provider value={{ showBanner, dismissBanner }}>
      {children}
      {bannerData ? (
        <NotificationBanner
          key={showCount}
          title={bannerData.title}
          subtitle={bannerData.subtitle}
          onAction={bannerData.onAction}
          onDismiss={() => {
            setBannerData(null)
          }}
        />
      ) : null}
    </NotificationBannerContext.Provider>
  )
}

/** Access notification banner controls; throws if used outside {@link NotificationBannerProvider}. */
export const useNotificationBanner = createContextHook(
  NotificationBannerContext,
  'NotificationBannerContext'
)

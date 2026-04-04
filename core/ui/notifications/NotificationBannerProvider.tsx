import { ChildrenProp } from '@lib/ui/props'
import { createContextHook } from '@lib/ui/state/createContextHook'
import {
  createContext,
  type TransitionEvent,
  useEffect,
  useRef,
  useState,
} from 'react'
import styled from 'styled-components'

import {
  bannerHeightPx,
  KeysignNotificationBanner,
  transitionDuration,
  transitionEasing,
} from './KeysignNotificationBanner'

const autoDismissMs = 30_000

/** Payload for the keysign invite top banner. */
export type NotificationBannerData = {
  title: string
  vaultName: string
  description: string
  isFastVault: boolean
  onAction: () => void
}

/** Context API for controlling the global keysign notification banner. */
type NotificationBannerContextValue = {
  showBanner: (data: NotificationBannerData) => void
  dismissBanner: () => void
}

const NotificationBannerContext = createContext<
  NotificationBannerContextValue | undefined
>(undefined)

const Root = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`

/**
 * Collapsible slot whose max-height transitions open/closed in sync with the
 * banner's own translateY, matching iOS VStack push-down behavior.
 */
const BannerSlot = styled.div<{ $isOpen: boolean }>`
  flex-shrink: 0;
  max-height: ${({ $isOpen }) => ($isOpen ? `${bannerHeightPx}px` : '0')};
  overflow: hidden;
  transition: max-height ${transitionDuration} ${transitionEasing};
`

const ContentArea = styled.div`
  flex: 1;
  min-height: 0;
  position: relative;
`

/** Root provider for in-app keysign notification banners (show / dismiss from anywhere). */
export const NotificationBannerProvider = ({ children }: ChildrenProp) => {
  const [bannerData, setBannerData] = useState<NotificationBannerData | null>(
    null
  )
  const [showCount, setShowCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const autoDismissTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )

  const showBanner = (data: NotificationBannerData) => {
    setBannerData(data)
    setShowCount(c => c + 1)
  }

  const dismiss = () => {
    setIsOpen(false)
  }

  useEffect(() => {
    if (!bannerData) return
    const id = requestAnimationFrame(() => {
      setIsOpen(true)
    })
    return () => cancelAnimationFrame(id)
  }, [bannerData, showCount])

  useEffect(() => {
    if (autoDismissTimer.current !== undefined) {
      clearTimeout(autoDismissTimer.current)
      autoDismissTimer.current = undefined
    }
    if (!isOpen) return
    autoDismissTimer.current = setTimeout(dismiss, autoDismissMs)
    return () => {
      if (autoDismissTimer.current !== undefined) {
        clearTimeout(autoDismissTimer.current)
      }
    }
  }, [isOpen, showCount])

  const handleSlotTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== 'max-height') return
    if (!isOpen) {
      setBannerData(null)
    }
  }

  return (
    <NotificationBannerContext.Provider
      value={{ showBanner, dismissBanner: dismiss }}
    >
      <Root>
        <BannerSlot $isOpen={isOpen} onTransitionEnd={handleSlotTransitionEnd}>
          {bannerData ? (
            <KeysignNotificationBanner
              key={showCount}
              description={bannerData.description}
              isFastVault={bannerData.isFastVault}
              isOpen={isOpen}
              title={bannerData.title}
              vaultName={bannerData.vaultName}
              onAction={bannerData.onAction}
              onDismiss={dismiss}
            />
          ) : null}
        </BannerSlot>
        <ContentArea>{children}</ContentArea>
      </Root>
    </NotificationBannerContext.Provider>
  )
}

/** Access notification banner controls; throws if used outside {@link NotificationBannerProvider}. */
export const useNotificationBanner = createContextHook(
  NotificationBannerContext,
  'NotificationBannerContext'
)

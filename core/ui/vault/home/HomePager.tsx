import { useHorizontalWheelPaging } from '@lib/ui/hooks/useHorizontalWheelPaging'
import { Center } from '@lib/ui/layout/Center'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { useQueryClient } from '@tanstack/react-query'
import { animate, motion, useReducedMotion, useTransform } from 'framer-motion'
import { Suspense, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { HomeFloatingHeader } from './HomeFloatingHeader'
import { useHomeMotion } from './homeMotion'
import { swipeSettleTransition, tabSwitchTransition } from './homeMotionConfig'
import { HomePagerPage } from './HomePagerPage'
import { HomeTab, homeTabs, useNavigateToHomeTab } from './homeTab'
import { LazyDefiHomePage } from './lazyDefiHome'
import { WalletHomePage } from './WalletHomePage'

/** Elements whose horizontal swipes are their own, not the pager's. */
const homePagerIgnoreSelector = '[data-home-pager-ignore]'

const lastIndex = homeTabs.length - 1
/** Share of a drag past either end that still moves the pages. */
const edgeResistance = 0.3

const withEdgeResistance = (position: number) => {
  if (position < 0) return position * edgeResistance
  if (position > lastIndex) {
    return lastIndex + (position - lastIndex) * edgeResistance
  }

  return position
}

type HomePagerProps = {
  tab: HomeTab
}

/**
 * Wallet and DeFi side by side in one horizontal track. A tab change slides
 * the track with a spring; a two-finger trackpad swipe follows the fingers and
 * pages once it passes a threshold. Both pages stay mounted once shown, so
 * each keeps its scroll position. The DeFi page loads on first need.
 */
export const HomePager = ({ tab }: HomePagerProps) => {
  const { position } = useHomeMotion()
  const navigateToTab = useNavigateToHomeTab()
  const queryClient = useQueryClient()
  const shouldReduceMotion = useReducedMotion() === true
  const tabIndex = homeTabs.indexOf(tab)
  const targetIndexRef = useRef(tabIndex)
  const [isDefiNeeded, setIsDefiNeeded] = useState(tab === 'defi')
  const trackX = useTransform(position, value => `${-value * 100}%`)

  if (tab === 'defi' && !isDefiNeeded) {
    setIsDefiNeeded(true)
  }

  const settle = (index: number, transition = tabSwitchTransition) => {
    if (shouldReduceMotion) {
      position.set(index)
    } else {
      animate(position, index, transition)
    }
  }

  useEffect(() => {
    if (targetIndexRef.current === tabIndex) return

    targetIndexRef.current = tabIndex
    if (shouldReduceMotion) {
      position.set(tabIndex)
    } else {
      animate(position, tabIndex, tabSwitchTransition)
    }
  }, [tabIndex, position, shouldReduceMotion])

  // A tab used to remount its page, which refetched its stale queries. Both
  // pages now stay mounted, so a switch refetches what has gone stale.
  const shownIndexRef = useRef(tabIndex)
  useEffect(() => {
    if (shownIndexRef.current === tabIndex) return

    shownIndexRef.current = tabIndex
    queryClient.refetchQueries({ type: 'active', stale: true })
  }, [tabIndex, queryClient])

  const wheelPagingRef = useHorizontalWheelPaging({
    ignoreSelector: homePagerIgnoreSelector,
    onDrag: (offsetPx, width) => {
      setIsDefiNeeded(true)
      position.stop()
      position.set(
        withEdgeResistance(targetIndexRef.current + offsetPx / width)
      )
    },
    onCancel: () => settle(targetIndexRef.current),
    onPage: direction => {
      const nextIndex = Math.min(
        Math.max(targetIndexRef.current + direction, 0),
        lastIndex
      )
      if (nextIndex === targetIndexRef.current) {
        settle(nextIndex)
        return
      }

      targetIndexRef.current = nextIndex
      navigateToTab(homeTabs[nextIndex])
      settle(nextIndex, swipeSettleTransition)
    },
  })

  return (
    <Viewport ref={wheelPagingRef}>
      <Track style={{ x: trackX }}>
        <HomePagerPage index={0} isActive={tab === 'wallet'}>
          <WalletHomePage />
        </HomePagerPage>
        <HomePagerPage index={1} isActive={tab === 'defi'}>
          {isDefiNeeded ? (
            <Suspense
              fallback={
                <Center>
                  <Spinner />
                </Center>
              }
            >
              <LazyDefiHomePage />
            </Suspense>
          ) : null}
        </HomePagerPage>
      </Track>
      <HomeFloatingHeader />
    </Viewport>
  )
}

const Viewport = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`

const Track = styled(motion.div)`
  display: flex;
  flex: 1;
  min-width: 0;
`

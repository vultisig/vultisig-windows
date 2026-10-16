import { Center } from '@lib/ui/layout/Center'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { requestIdle } from '@lib/ui/utils/requestIdle'
import { useQueryClient } from '@tanstack/react-query'
import { animate, motion, useReducedMotion, useTransform } from 'framer-motion'
import { Suspense, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { HomeFloatingHeader } from './HomeFloatingHeader'
import { useHomeMotion } from './homeMotion'
import { tabSwitchTransition } from './homeMotionConfig'
import { HomePagerPage } from './HomePagerPage'
import { HomeTab, homeTabs } from './homeTab'
import { LazyDefiHomePage } from './lazyDefiHome'
import { WalletHomePage } from './WalletHomePage'

type HomePagerProps = {
  tab: HomeTab
}

/** Both pages stay mounted once shown, so each keeps its scroll position. */
export const HomePager = ({ tab }: HomePagerProps) => {
  const { position } = useHomeMotion()
  const queryClient = useQueryClient()
  const shouldReduceMotion = useReducedMotion() === true
  const tabIndex = homeTabs.indexOf(tab)
  const [isDefiNeeded, setIsDefiNeeded] = useState(tab === 'defi')
  const trackX = useTransform(position, value => `${-value * 100}%`)

  if (tab === 'defi' && !isDefiNeeded) {
    setIsDefiNeeded(true)
  }

  // Mounted off screen once home is idle, so the first switch only slides.
  useEffect(() => requestIdle(() => setIsDefiNeeded(true)), [])

  // Pages stay mounted, so a switch must also refetch what has gone stale.
  const shownIndexRef = useRef(tabIndex)
  useEffect(() => {
    if (shownIndexRef.current === tabIndex) return

    shownIndexRef.current = tabIndex
    if (shouldReduceMotion) {
      position.set(tabIndex)
    } else {
      animate(position, tabIndex, tabSwitchTransition)
    }
    queryClient.refetchQueries({ type: 'active', stale: true })
  }, [tabIndex, position, shouldReduceMotion, queryClient])

  return (
    <Viewport>
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

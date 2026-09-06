import { List } from '@lib/ui/list'
import { OnCloseProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useSwapRoutes } from '../../queries/useSwapRoutes'
import { AdvancedSheet } from './AdvancedSheet'
import { SheetBackIcon } from './icons/SheetBackIcon'
import { SwapRouteOption } from './SwapRouteOption'

/**
 * Every route fetched for the current quote cycle, best→worst by net output,
 * with the active pick lifted to the top so it is visible without scrolling.
 * Picking a route holds for as long as the pair and amount stay put — later
 * refreshes re-quote that provider rather than reverting to the winner — and
 * returns to the Advanced Swap sheet.
 */
export const SelectRouteSheet = ({ onClose }: OnCloseProp) => {
  const { t } = useTranslation()
  const { candidates, activeRoute, selectRoute } = useSwapRoutes()

  const orderedCandidates = activeRoute
    ? [
        activeRoute,
        ...candidates.filter(
          ({ providerName }) => providerName !== activeRoute.providerName
        ),
      ]
    : candidates

  return (
    <AdvancedSheet
      title={t('select_route')}
      onClose={onClose}
      leftIcon={<SheetBackIcon />}
    >
      <Scrollable>
        <List border="solid">
          {orderedCandidates.map(candidate => (
            <SwapRouteOption
              key={candidate.providerName}
              value={candidate}
              isActive={candidate.providerName === activeRoute?.providerName}
              onSelect={() => {
                selectRoute(candidate.providerName)
                onClose()
              }}
            />
          ))}
        </List>
      </Scrollable>
    </AdvancedSheet>
  )
}

// A definite max-height rather than flex growth: the sheet has no
// definite-height ancestor on desktop, where a growing list collapses to zero.
const Scrollable = styled.div`
  max-height: 320px;
  overflow-y: auto;
`

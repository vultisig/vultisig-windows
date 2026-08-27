import '@core/ui/i18n/config'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import styled, { css } from 'styled-components'

import { CircleScenario } from './circleScenario'
import { KaminoScenario } from './kaminoScenario'
import { TronClaimFormScenario, TronWithdrawalsScenario } from './tronScenario'

const scenarios = {
  circle: CircleScenario,
  kamino: KaminoScenario,
  'tron-claim-form': TronClaimFormScenario,
  'tron-withdrawals': TronWithdrawalsScenario,
}

type ScenarioName = keyof typeof scenarios

// `Object.hasOwn`, not `in`: `?scenario=constructor` would otherwise resolve
// through the prototype chain and render whatever it found instead of the
// fallback.
const isScenarioName = (value: string | null): value is ScenarioName =>
  value !== null && Object.hasOwn(scenarios, value)

const requested = new URLSearchParams(window.location.search).get('scenario')
const Scenario = scenarios[isScenarioName(requested) ? requested : 'circle']

const isTronScenario = requested?.startsWith('tron-') ?? false

const Page = styled.div<{ $isTronScenario: boolean }>`
  width: 430px;
  margin: 0 auto;

  ${({ $isTronScenario }) =>
    $isTronScenario
      ? css`
          height: 720px;
        `
      : css`
          min-height: 720px;
          padding: 16px;
        `}
`

const rootElement = document.getElementById('root')

if (rootElement === null) {
  throw new Error('Missing root element')
}

createRoot(rootElement).render(
  <StrictMode>
    <Page $isTronScenario={isTronScenario}>
      <Scenario />
    </Page>
  </StrictMode>
)

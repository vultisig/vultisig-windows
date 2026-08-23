import '@core/ui/i18n/config'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import styled from 'styled-components'

import { CircleScenario } from './circleScenario'
import { KaminoScenario } from './kaminoScenario'

const scenarios = {
  circle: CircleScenario,
  kamino: KaminoScenario,
}

type ScenarioName = keyof typeof scenarios

// `Object.hasOwn`, not `in`: `?scenario=constructor` would otherwise resolve
// through the prototype chain and render whatever it found instead of the
// fallback.
const isScenarioName = (value: string | null): value is ScenarioName =>
  value !== null && Object.hasOwn(scenarios, value)

const requested = new URLSearchParams(window.location.search).get('scenario')
const Scenario = scenarios[isScenarioName(requested) ? requested : 'circle']

const Page = styled.div`
  width: 430px;
  min-height: 720px;
  margin: 0 auto;
  padding: 16px;
`

const rootElement = document.getElementById('root')

if (rootElement === null) {
  throw new Error('Missing root element')
}

createRoot(rootElement).render(
  <StrictMode>
    <Page>
      <Scenario />
    </Page>
  </StrictMode>
)

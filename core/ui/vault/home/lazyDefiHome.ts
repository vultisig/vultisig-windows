import { lazy } from 'react'

const loadDefiHomePage = () => import('@core/ui/defi/home/DefiHomePage')
const loadDefiAwareBalanceQuery = () =>
  import('@core/ui/defi/home/DefiAwareBalanceQuery')
const loadDefiHomeHeaderControls = () =>
  import('@core/ui/defi/home/DefiHomeHeaderControls')

/** Kept out of the popup's entry chunk; loaded on first need or once home is idle. */
export const loadDefiHome = () =>
  Promise.all([
    loadDefiHomePage(),
    loadDefiAwareBalanceQuery(),
    loadDefiHomeHeaderControls(),
  ])

export const LazyDefiHomePage = lazy(() =>
  loadDefiHomePage().then(({ DefiHomePage }) => ({ default: DefiHomePage }))
)

export const LazyDefiAwareBalanceQuery = lazy(() =>
  loadDefiAwareBalanceQuery().then(({ DefiAwareBalanceQuery }) => ({
    default: DefiAwareBalanceQuery,
  }))
)

export const LazyDefiHomeHeaderControls = lazy(() =>
  loadDefiHomeHeaderControls().then(({ DefiHomeHeaderControls }) => ({
    default: DefiHomeHeaderControls,
  }))
)

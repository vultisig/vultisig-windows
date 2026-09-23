// @vitest-environment happy-dom
import { act, renderHook } from '@testing-library/react'
import { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { NavigationProvider, useNavigation } from '../state'
import { View } from '../View'
import { useNavigate } from './useNavigate'
import { useNavigateBack } from './useNavigateBack'

const homeView: View = { id: 'vault' }
const initialHistory: View[] = [
  homeView,
  { id: 'swap' },
  { id: 'keysign', state: { secret: 'value' } },
]

const wrapper = ({ children }: { children: ReactNode }) => (
  <NavigationProvider initialValue={{ history: initialHistory }}>
    {children}
  </NavigationProvider>
)

const useNavigationHarness = () => {
  const [{ history }] = useNavigation()
  return { history, navigate: useNavigate(), goBack: useNavigateBack() }
}

describe('useNavigate', () => {
  it('pushes the view onto the history by default', () => {
    const { result } = renderHook(useNavigationHarness, { wrapper })

    act(() => result.current.navigate(homeView))

    expect(result.current.history).toEqual([...initialHistory, homeView])
  })

  it('replaces the whole history on reset so back cannot return to it', () => {
    const { result } = renderHook(useNavigationHarness, { wrapper })

    act(() => result.current.navigate(homeView, { reset: true }))
    expect(result.current.history).toEqual([homeView])

    act(() => result.current.goBack())
    expect(result.current.history).toEqual([homeView])
  })
})

// @vitest-environment happy-dom

import { render } from '@testing-library/react'
import { createElement, ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

const peersQueryState = vi.hoisted(() => ({
  value: {
    data: undefined as string[] | undefined,
    error: null as Error | null,
    isError: false,
  },
}))

vi.mock('@core/ui/mpc/devices/queries/useMpcPeerOptionsQuery', () => ({
  useMpcPeerOptionsQuery: () => peersQueryState.value,
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

vi.mock('@core/ui/flow/FlowErrorPageContent', () => ({
  FlowErrorPageContent: () => createElement('div', null, 'error'),
}))

vi.mock('@lib/ui/page/PageHeader', () => ({
  PageHeader: () => createElement('header'),
}))

vi.mock('@lib/ui/query/components/MatchQuery', () => ({
  MatchQuery: ({
    error,
    pending,
    value,
  }: {
    error: (error: Error | null) => ReactNode
    pending: () => ReactNode
    value: { error: Error | null; isError: boolean }
  }) => (value.isError ? error(value.error) : pending()),
}))

import { WaitForServerStep } from '@core/ui/mpc/fast/WaitForServerStep'

describe('WaitForServerStep', () => {
  it('reports recovery so a persistent progress host can be restored', () => {
    const onErrorChange = vi.fn()
    const view = render(
      <WaitForServerStep
        onErrorChange={onErrorChange}
        onFinish={() => {}}
        renderPending={() => null}
      />
    )

    expect(onErrorChange).toHaveBeenLastCalledWith(false)

    peersQueryState.value = {
      data: undefined,
      error: new Error('server unavailable'),
      isError: true,
    }
    view.rerender(
      <WaitForServerStep
        onErrorChange={onErrorChange}
        onFinish={() => {}}
        renderPending={() => null}
      />
    )

    expect(onErrorChange).toHaveBeenLastCalledWith(true)

    peersQueryState.value = {
      data: undefined,
      error: null,
      isError: false,
    }
    view.rerender(
      <WaitForServerStep
        onErrorChange={onErrorChange}
        onFinish={() => {}}
        renderPending={() => null}
      />
    )

    expect(onErrorChange).toHaveBeenLastCalledWith(false)
  })
})

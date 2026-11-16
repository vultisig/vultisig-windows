import { darkTheme } from '@lib/ui/theme/darkTheme'
import { renderToString } from 'react-dom/server'
import { ThemeProvider } from 'styled-components'
import { describe, expect, it, vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, { count }: { count: number }) => `${key}:${count}`,
  }),
}))

import { KeysignManyInputsNotice } from './KeysignManyInputsNotice'

const render = (count: number) =>
  renderToString(
    <ThemeProvider theme={darkTheme}>
      <KeysignManyInputsNotice value={count} />
    </ThemeProvider>
  )

describe('KeysignManyInputsNotice', () => {
  it('shows the slow-signing notice from 10 messages, with the count', () => {
    expect(render(9)).toBe('')
    expect(render(10)).toContain('keysign_many_inputs:10')
  })
})

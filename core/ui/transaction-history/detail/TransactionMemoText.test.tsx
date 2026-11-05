import { darkTheme } from '@lib/ui/theme/darkTheme'
import { renderToString } from 'react-dom/server'
import { ThemeProvider } from 'styled-components'
import { describe, expect, it } from 'vitest'

import { TransactionMemoText } from './TransactionMemoText'

const approveCalldata =
  '0x095ea7b3000000000000000000000000000000000022d473030f116ddee9f6b43ac78ba3ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffa0b8'

describe('TransactionMemoText', () => {
  it('lets an unbroken memo like EVM calldata wrap inside the card', () => {
    const html = renderToString(
      <ThemeProvider theme={darkTheme}>
        <TransactionMemoText value={approveCalldata} />
      </ThemeProvider>
    )

    expect(html).toContain(approveCalldata)
    expect(html).toContain('overflow-wrap:anywhere')
    expect(html).toContain('text-align:right')
  })
})

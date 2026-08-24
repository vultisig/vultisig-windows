import { readFileSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  join(__dirname, 'TransactionStatusWatcher.tsx'),
  'utf8'
)

// `useRefreshPendingTransactions` is a one-shot `useEffect`, not a poller: it
// runs when `records` changes and never again. Mounting it here looked like
// app-wide polling but only ever asked the chain once — at broadcast, when the
// transaction is still pending — so a swap's balances never settled on their
// own (issue #4690). Continuous polling requires the per-record query hook.
describe('TransactionStatusWatcher', () => {
  it('polls each pending record instead of sweeping once', () => {
    expect(source).toContain('PendingTransactionWatch')
    expect(source).not.toContain('useRefreshPendingTransactions')
  })

  it('leaves limit orders to their own tracker', () => {
    expect(source).toContain("record.type !== 'limitSwap'")
  })
})

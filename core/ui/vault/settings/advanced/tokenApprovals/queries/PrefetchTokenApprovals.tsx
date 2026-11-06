import { useCore } from '@core/ui/state/core'

import { useTokenApprovalsQueries } from './useTokenApprovalsQueries'

const StartTokenApprovalsQueries = () => {
  useTokenApprovalsQueries({ missingOnly: true })
  return null
}

/**
 * Starts the approvals lookup on the vault settings screen when no list is
 * stored yet, so the Token Approvals page opens with its data. Extension only,
 * like the page.
 */
export const PrefetchTokenApprovals = () => {
  const { client } = useCore()

  return client === 'extension' ? <StartTokenApprovalsQueries /> : null
}

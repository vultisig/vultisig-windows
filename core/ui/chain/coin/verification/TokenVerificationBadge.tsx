import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'

import { TokenVerificationPill } from './TokenVerificationPill'
import {
  isVerifiableToken,
  useTokenVerificationQuery,
  VerifiableToken,
} from './useTokenVerificationQuery'

const VerifiableTokenBadge = ({ value }: ValueProp<VerifiableToken>) => {
  const query = useTokenVerificationQuery(value)

  return (
    <MatchQuery
      value={query}
      success={verification => <TokenVerificationPill value={verification} />}
    />
  )
}

/**
 * Drop-in verification label for anywhere a coin's ticker is shown. Resolves
 * the tier for tokens on chains that have a verification source (TON jettons
 * today) and renders nothing at all for everything else, while the lookup is
 * in flight, when it fails, and for verified tokens — so it can sit next to a
 * ticker unconditionally without shifting layout for the common case.
 */
export const TokenVerificationBadge = ({
  value,
}: ValueProp<VerifiableToken>) =>
  isVerifiableToken(value) ? <VerifiableTokenBadge value={value} /> : null

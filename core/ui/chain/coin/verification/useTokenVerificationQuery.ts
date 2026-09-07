import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'
import { ChainKind, getChainKind } from '@vultisig/core-chain/ChainKind'
import { getTonJettonVerification } from '@vultisig/core-chain/chains/ton/jetton/verification'
import { CoinKey, CoinMetadata } from '@vultisig/core-chain/coin/Coin'
import { TokenVerification } from '@vultisig/core-chain/coin/tokenVerification'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { convertDuration } from '@vultisig/lib-utils/time/convertDuration'

/** The minimum a token row or approval card knows about the coin it shows. */
export type VerifiableToken = CoinKey & Pick<CoinMetadata, 'ticker'>

type TokenVerificationResolverInput = {
  id: string
  ticker: string
}

type TokenVerificationResolver = (
  input: TokenVerificationResolverInput
) => Promise<TokenVerification>

const tokenVerificationResolvers: Partial<
  Record<ChainKind, TokenVerificationResolver>
> = {
  ton: getTonJettonVerification,
}

/**
 * Whether a verification tier exists for this coin: a token (not the chain's
 * fee coin) on a chain with a verification source. Fee coins are trivially
 * trusted and never labelled.
 */
export const isVerifiableToken = ({ chain, id }: VerifiableToken): boolean =>
  !!id && getChainKind(chain) in tokenVerificationResolvers

/**
 * Verification tier of a token, cached for an hour: the answer only changes
 * when a whitelist is edited, and every row of a token list asks for it.
 */
export const useTokenVerificationQuery = ({
  chain,
  id,
  ticker,
}: VerifiableToken) =>
  useQuery({
    queryKey: ['tokenVerification', chain, id?.toLowerCase(), ticker],
    queryFn: () => {
      const resolve = shouldBePresent(
        tokenVerificationResolvers[getChainKind(chain)],
        'token verification resolver'
      )

      return resolve({ id: shouldBePresent(id, 'token id'), ticker })
    },
    staleTime: convertDuration(1, 'h', 'ms'),
    ...noRefetchQueryOptions,
  })

import { DydxVoteOption } from '@vultisig/core-chain/chains/cosmos/dydx/dydxVoteMemo'
import { useTranslation } from 'react-i18next'

/** What the user reads for each dYdX governance ballot. */
export const useDydxVoteOptionLabels = (): Record<DydxVoteOption, string> => {
  const { t } = useTranslation()

  return {
    yes: t('chainFunctions.vote.options.yes'),
    abstain: t('chainFunctions.vote.options.abstain'),
    no: t('chainFunctions.vote.options.no'),
    noWithVeto: t('chainFunctions.vote.options.noWithVeto'),
  }
}

import { useTranslation } from 'react-i18next'

import { GovVoteOption } from '../../../vote/govVoteOption'

/** What the user reads for each governance ballot. */
export const useGovVoteOptionLabels = (): Record<GovVoteOption, string> => {
  const { t } = useTranslation()

  return {
    yes: t('chainFunctions.vote.options.yes'),
    abstain: t('chainFunctions.vote.options.abstain'),
    no: t('chainFunctions.vote.options.no'),
    noWithVeto: t('chainFunctions.vote.options.noWithVeto'),
  }
}

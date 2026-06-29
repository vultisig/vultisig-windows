import { StartKeysignPrompt } from '@core/ui/mpc/keysign/prompt/StartKeysignPrompt'
import { StartKeysignPromptProps } from '@core/ui/mpc/keysign/prompt/StartKeysignPromptProps'
import { QbtcVoteSelection } from '@vultisig/core-chain/chains/cosmos/qbtc/governance/proposal'
import { extractErrorMsg } from '@vultisig/lib-utils/error/extractErrorMsg'
import { useTranslation } from 'react-i18next'

import { useQbtcVoteKeysignPayloadQuery } from '../vote/useQbtcVoteKeysignPayloadQuery'

type GovernanceVoteConfirmButtonProps = {
  voterAddress: string
  proposalId: string
  selection: QbtcVoteSelection
}

/**
 * Builds the QBTC vote keysign payload and hands it to the shared keysign
 * prompt, which runs the ML-DSA ceremony and broadcasts via Cosmos REST.
 */
export const GovernanceVoteConfirmButton = ({
  voterAddress,
  proposalId,
  selection,
}: GovernanceVoteConfirmButtonProps) => {
  const { t } = useTranslation()
  const { data, error, isPending } = useQbtcVoteKeysignPayloadQuery({
    voterAddress,
    proposalId,
    selection,
  })

  const promptProps: StartKeysignPromptProps = isPending
    ? { disabledMessage: t('loading') }
    : error
      ? { disabledMessage: extractErrorMsg(error) }
      : data
        ? { keysignPayload: data }
        : { disabledMessage: t('loading') }

  return <StartKeysignPrompt {...promptProps} />
}

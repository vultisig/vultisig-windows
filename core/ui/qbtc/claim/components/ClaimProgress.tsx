import { MultistepProgressIndicator } from '@lib/ui/flow/MultistepProgressIndicator'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Text } from '@lib/ui/text'
import { match } from '@vultisig/lib-utils/match'
import { useTranslation } from 'react-i18next'

import { ClaimPhase } from '../hooks/useQbtcClaimMutation'

const progressPhases: ClaimPhase[] = ['signing', 'provingProof', 'broadcasting']

type ClaimProgressProps = {
  phase: ClaimPhase
}

/**
 * Renders a 3-step progress indicator for the claim pipeline.
 * The `provingProof` phase can take up to 300 seconds — the copy makes
 * that explicit so users don't think the screen is frozen.
 */
export const ClaimProgress = ({ phase }: ClaimProgressProps) => {
  const { t } = useTranslation()

  const progressValue = match(phase, {
    idle: () => 0,
    signing: () => 1,
    provingProof: () => 2,
    broadcasting: () => 3,
    done: () => 3,
  })
  const label = match(phase, {
    idle: () => t('qbtc_claim_preparing'),
    signing: () => t('qbtc_claim_signing'),
    provingProof: () => t('qbtc_claim_proving'),
    broadcasting: () => t('qbtc_claim_broadcasting'),
    done: () => t('qbtc_claim_broadcasting'),
  })
  const helper = phase === 'provingProof' ? t('qbtc_claim_proving_hint') : null

  return (
    <VStack alignItems="center" gap={16} style={{ paddingTop: 32 }}>
      <Spinner />
      <MultistepProgressIndicator
        value={progressValue}
        steps={progressPhases.length}
        variant="bars"
        markPreviousStepsAsCompleted
      />
      <VStack alignItems="center" gap={4}>
        <Text color="contrast" size={14} weight="600">
          {label}
        </Text>
        {helper && (
          <Text color="supporting" size={12}>
            {helper}
          </Text>
        )}
      </VStack>
    </VStack>
  )
}

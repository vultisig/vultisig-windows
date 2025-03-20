import { KeygenType } from '@core/mpc/keygen/KeygenType'
import { ValueProp } from '@lib/ui/props'
import { match } from '@lib/utils/match'
import { useTranslation } from 'react-i18next'

import RingProgress from '../../../components/ringProgress/RingProgress'
import { VStack } from '../../../lib/ui/layout/Stack'
import { Text } from '../../../lib/ui/text'
import { useCurrentKeygenType } from '../state/currentKeygenType'
import { KeygenStatus } from './MatchKeygenSessionStatus'

const keygenCompletion: Record<KeygenStatus, number> = {
  prepareVault: 25,
  ecdsa: 50,
  eddsa: 70,
}

export const KeygenProgressIndicator = ({ value }: ValueProp<KeygenStatus>) => {
  const { t } = useTranslation()

  const keygenType = useCurrentKeygenType()

  const keygenStageText: Record<KeygenStatus, string | null> = {
    prepareVault: t('prepareVault'),
    ecdsa: match(keygenType, {
      [KeygenType.Keygen]: () => t('generating_ecdsa_key'),
      [KeygenType.Migrate]: () => t('generating_ecdsa_key'),
      [KeygenType.Reshare]: () => t('resharing_ecdsa_key'),
    }),
    eddsa: match(keygenType, {
      [KeygenType.Keygen]: () => t('generating_eddsa_key'),
      [KeygenType.Migrate]: () => t('generating_eddsa_key'),
      [KeygenType.Reshare]: () => t('resharing_eddsa_key'),
    }),
  }

  const completion = keygenCompletion[value]
  const text = keygenStageText[value]

  return (
    <VStack gap={12} alignItems="center">
      <RingProgress size={100} strokeWidth={10} progress={completion} />
      {text && (
        <Text family="mono" color="contrast" size={14} weight="400">
          {text}
        </Text>
      )}
    </VStack>
  )
}

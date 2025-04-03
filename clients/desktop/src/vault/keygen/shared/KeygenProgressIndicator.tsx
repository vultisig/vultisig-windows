import { KeygenStep } from '@core/mpc/keygen/KeygenStep'
import { KeygenType } from '@core/mpc/keygen/KeygenType'
import { VStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { match } from '@lib/utils/match'
import { useTranslation } from 'react-i18next'

import RingProgress from '../../../components/ringProgress/RingProgress'
import { useCurrentKeygenType } from '../state/currentKeygenType'

const keygenCompletion: Record<KeygenStep, number> = {
  prepareVault: 25,
  ecdsa: 50,
  eddsa: 70,
}

export const KeygenProgressIndicator = ({ value }: ValueProp<KeygenStep>) => {
  const { t } = useTranslation()

  const keygenType = useCurrentKeygenType()

  const keygenStageText: Record<KeygenStep, string | null> = {
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

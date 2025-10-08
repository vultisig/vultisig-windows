import { Animation as RivAnimation } from '@lib/ui/animations/Animation'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { VStack } from '@lib/ui/layout/Stack'
import { GradientText } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

export const Animation = () => {
  const { t } = useTranslation()

  return (
    <VStack style={{ height: 220, position: 'relative' }} fullWidth>
      <RivAnimation src="/core/animations/vault-created.riv" />
      <AnimatedVisibility delay={300}>
        <GradientText
          as="span"
          size={24}
          style={{ bottom: 40, left: 0, position: 'absolute', right: 0 }}
          centerHorizontally
        >
          {t('signature_successful')}
        </GradientText>
      </AnimatedVisibility>
    </VStack>
  )
}

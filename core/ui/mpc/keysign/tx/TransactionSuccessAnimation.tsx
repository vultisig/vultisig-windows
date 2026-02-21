import { Animation } from '@lib/ui/animations/Animation'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { VStack } from '@lib/ui/layout/Stack'
import { GradientText } from '@lib/ui/text'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

type TransactionSuccessAnimationProps = {
  animationSrc?: string
  children?: ReactNode
}

export const TransactionSuccessAnimation = ({
  animationSrc = '/core/animations/vault-created.riv',
  children,
}: TransactionSuccessAnimationProps) => {
  const { t } = useTranslation()
  return (
    <VStack style={{ height: 220, position: 'relative' }} fullWidth>
      <Animation src={animationSrc} />
      <AnimatedVisibility delay={300}>
        <GradientText
          as="span"
          size={24}
          style={{ bottom: 40, left: 0, position: 'absolute', right: 0 }}
          centerHorizontally
        >
          {t('transaction_successful')}
        </GradientText>
      </AnimatedVisibility>
      {children}
    </VStack>
  )
}

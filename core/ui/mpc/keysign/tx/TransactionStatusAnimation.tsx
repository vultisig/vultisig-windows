import { Animation } from '@lib/ui/animations/Animation'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { VStack } from '@lib/ui/layout/Stack'
import { GradientText, Text } from '@lib/ui/text'
import { match } from '@lib/utils/match'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { TransactionErrorIcon } from './TransactionErrorIcon'

type TransactionStatus = 'pending' | 'success' | 'error'

type TransactionStatusAnimationProps = {
  status: TransactionStatus
}

export const TransactionStatusAnimation = ({
  status,
}: TransactionStatusAnimationProps) => {
  const { t } = useTranslation()

  return (
    <VStack style={{ height: 220, position: 'relative' }} fullWidth>
      <AnimationArea>
        {match(status, {
          pending: () => (
            <Animation src="/core/animations/transaction-pending.riv" />
          ),
          success: () => <Animation src="/core/animations/vault-created.riv" />,
          error: () => <TransactionErrorIcon />,
        })}
      </AnimationArea>
      <AnimatedVisibility delay={300}>
        {match<TransactionStatus, React.ReactNode>(status, {
          pending: () => (
            <StatusText color="contrast">{t('transaction_pending')}</StatusText>
          ),
          success: () => (
            <StatusText color="contrast">
              <Trans
                i18nKey="transaction_successful"
                components={{ g: <GradientText as="span" /> }}
              />
            </StatusText>
          ),
          error: () => (
            <StatusText color="contrast">
              <Trans
                i18nKey="transaction_failed"
                components={{ error: <Text as="span" color="danger" /> }}
              />
            </StatusText>
          ),
        })}
      </AnimatedVisibility>
    </VStack>
  )
}

const AnimationArea = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 0;
`

const StatusText = styled(Text).attrs({
  size: 24,
  centerHorizontally: true,
})`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
`

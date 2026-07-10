import { Animation } from '@lib/ui/animations/Animation'
import { VStack } from '@lib/ui/layout/Stack'
import { GradientText, Text } from '@lib/ui/text'
import { match } from '@vultisig/lib-utils/match'
import { AnimatePresence, motion } from 'framer-motion'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { TransactionErrorIcon } from './TransactionErrorIcon'

type TransactionStatus = 'broadcasted' | 'pending' | 'success' | 'error'

type TransactionStatusAnimationProps = {
  status: TransactionStatus
}

export const TransactionStatusAnimation = ({
  status,
}: TransactionStatusAnimationProps) => {
  const { t } = useTranslation()

  const testIdMap: Record<TransactionStatus, string> = {
    broadcasted: 'keysign-broadcasted',
    pending: 'keysign-pending',
    success: 'keysign-success',
    error: 'keysign-failure',
  }

  return (
    <VStack
      style={{ height: 220, position: 'relative' }}
      fullWidth
      data-testid="keysign-progress"
      data-status={status}
    >
      <AnimationArea>
        <AnimatePresence mode="wait" initial={false}>
          <StatusVisual
            key={status}
            data-testid={testIdMap[status]}
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -8 }}
            transition={{ duration: 0.24, ease: 'easeInOut' }}
          >
            {match(status, {
              broadcasted: () => (
                <BroadcastedAnimation>
                  <Animation src="/core/animations/transaction-pending.riv" />
                </BroadcastedAnimation>
              ),
              pending: () => (
                <Animation src="/core/animations/transaction-pending.riv" />
              ),
              success: () => (
                <Animation src="/core/animations/vault-created.riv" />
              ),
              error: () => <TransactionErrorIcon />,
            })}
          </StatusVisual>
        </AnimatePresence>
      </AnimationArea>
      <AnimatePresence mode="wait" initial={false}>
        <StatusText
          key={status}
          color="contrast"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: 'easeInOut', delay: 0.08 }}
        >
          {match<TransactionStatus, React.ReactNode>(status, {
            broadcasted: () =>
              `${t('transaction')} ${t('broadcasted').toLowerCase()}`,
            pending: () => t('transaction_pending'),
            success: () => (
              <Trans
                i18nKey="transaction_successful"
                components={{ g: <GradientText as="span" /> }}
              />
            ),
            error: () => (
              <Trans
                i18nKey="transaction_failed"
                components={{ error: <Text as="span" color="danger" /> }}
              />
            ),
          })}
        </StatusText>
      </AnimatePresence>
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

const StatusVisual = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`

const BroadcastedAnimation = styled.div`
  width: 48px;
  height: 48px;
`

const StatusText = styled(motion(Text)).attrs({
  size: 24,
  centerHorizontally: true,
})`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
`

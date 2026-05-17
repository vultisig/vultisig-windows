import { customMessageDefaultChain } from '@core/ui/mpc/keysign/customMessage/chains'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { CollapsableStateIndicator } from '@lib/ui/layout/CollapsableStateIndicator'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { MiddleTruncate } from '@lib/ui/truncate'
import { Chain } from '@vultisig/core-chain/Chain'
import { CustomMessagePayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { AnimatePresence, motion } from 'framer-motion'
import { FC, ReactNode, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const Section = styled(VStack)`
  background-color: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 16px;
`

const Divider = styled.div`
  background-image: linear-gradient(
    90deg,
    ${getColor('foreground')} 0%,
    ${getColor('foregroundExtra')} 49.5%,
    ${getColor('foreground')} 100%
  );
  height: 1px;
`

const JoinSignMessageCollapse: FC<{
  title: string
  /** Stable key for message body; avoids effect churn from new React element identities each render. */
  contentKey: string
  children: ReactNode
}> = ({ title, children, contentKey }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [height, setHeight] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) setHeight(ref.current.scrollHeight)
  }, [isOpen, contentKey])

  return (
    <Section
      onClick={() => setIsOpen(!isOpen)}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          setIsOpen(prev => !prev)
        }
      }}
      role="button"
      tabIndex={0}
      aria-expanded={isOpen}
      style={{ cursor: 'pointer' }}
    >
      <HStack alignItems="center" justifyContent="space-between" padding={24}>
        <Text as="span" size={14} weight={500}>
          {title}
        </Text>
        <CollapsableStateIndicator isOpen={isOpen} />
      </HStack>
      <AnimatePresence initial={false}>
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: isOpen ? height : 0 }}
          exit={{ height: 0 }}
          transition={{ duration: 0.3 }}
          style={{ overflow: 'hidden' }}
        >
          <VStack gap={12} padding="0 24px 24px" ref={ref}>
            {children}
          </VStack>
        </motion.div>
      </AnimatePresence>
    </Section>
  )
}

const knownChains: readonly Chain[] = Object.values(Chain)

const resolveChain = (chain: string | undefined): Chain => {
  if (chain && isOneOf(chain, knownChains)) {
    return chain
  }
  return customMessageDefaultChain
}

export const JoinKeysignCustomMessageVerify = ({
  value,
}: ValueProp<CustomMessagePayload>) => {
  const { t } = useTranslation()
  const chain = resolveChain(value.chain)
  const address = useCurrentVaultAddress(chain)

  const formattedMessage = ((): string | null => {
    try {
      return JSON.stringify(JSON.parse(value.message), null, 2)
    } catch {
      return null
    }
  })()

  const showMethod = value.method.trim() !== ''

  return (
    <VStack gap={16} fullWidth>
      <Section gap={12} padding={24}>
        {showMethod && (
          <>
            <HStack
              alignItems="center"
              gap={8}
              justifyContent="space-between"
              wrap="nowrap"
            >
              <Text as="span" color="shy" size={14} weight={500} nowrap>
                {t('method')}
              </Text>
              <Text as="span" size={14} weight={500} nowrap>
                {value.method}
              </Text>
            </HStack>
            <Divider />
          </>
        )}
        <HStack
          alignItems="center"
          gap={8}
          justifyContent="space-between"
          wrap="nowrap"
        >
          <Text as="span" color="shy" size={14} weight={500} nowrap>
            {t('signing_address')}
          </Text>
          <MiddleTruncate
            justifyContent="end"
            size={14}
            text={address}
            weight={500}
            flexGrow
          />
        </HStack>
      </Section>
      <JoinSignMessageCollapse
        title={t('message')}
        contentKey={formattedMessage ?? value.message}
      >
        {formattedMessage ? (
          <Text color="info" family="mono" size={14} weight={500}>
            <pre style={{ width: '100%', margin: 0 }}>
              <code
                style={{
                  display: 'block',
                  overflowX: 'auto',
                  width: '100%',
                }}
              >
                {formattedMessage}
              </code>
            </pre>
          </Text>
        ) : (
          <Text as="span" color="info" size={14} weight={500}>
            {value.message}
          </Text>
        )}
      </JoinSignMessageCollapse>
    </VStack>
  )
}

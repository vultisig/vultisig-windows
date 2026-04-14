import { CollapsableStateIndicator } from '@lib/ui/layout/CollapsableStateIndicator'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useQuery } from '@tanstack/react-query'
import { getEvmContractCallInfo } from '@vultisig/core-chain/chains/evm/contract/call/info'
import { AnimatePresence, motion } from 'framer-motion'
import { FC, ReactNode, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { TxOverviewPlainMemo } from './TxOverviewPlainMemo'

const CollapseWrapper = styled(VStack)`
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 16px;
  cursor: pointer;
`

type CollapseProps = {
  children: ReactNode
  title: string
}

// Local collapse for the decoded EVM memo section. Kept in-file so this core/ui
// module doesn't take a workspace dep on core/inpage-provider — the same visual
// treatment lives there too, but promoting it to a shared location was out of
// scope for this PR.
const Collapse: FC<CollapseProps> = ({ children, title }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [height, setHeight] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) setHeight(ref.current.scrollHeight)
  }, [isOpen])

  return (
    <CollapseWrapper
      onClick={() => setIsOpen(prev => !prev)}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          setIsOpen(prev => !prev)
        }
      }}
      role="button"
      tabIndex={0}
      aria-expanded={isOpen}
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
    </CollapseWrapper>
  )
}

export const TxOverviewEvmMemo = ({ value }: ValueProp<string>) => {
  const query = useQuery({
    queryKey: ['evmContractCallInfo', value],
    queryFn: () => getEvmContractCallInfo(value),
    enabled: value.startsWith('0x') && value.length > 2,
    staleTime: Infinity,
  })
  const { t } = useTranslation()

  return (
    <MatchQuery
      value={query}
      pending={() => <Spinner />}
      error={() => <TxOverviewPlainMemo value={value} />}
      success={info => {
        if (!info) {
          return <TxOverviewPlainMemo value={value} />
        }

        const { functionSignature, functionArguments } = info

        return (
          <Collapse title={t('transaction_details')}>
            <VStack gap={4}>
              <Text color="shy" size={12}>
                {t('function_signature')}
              </Text>
              <Text color="primary" family="mono" size={14} weight="700">
                {functionSignature}
              </Text>
            </VStack>
            <VStack gap={4}>
              <Text color="shy" size={12}>
                {t('function_arguments')}
              </Text>
              <Text
                color="primary"
                family="mono"
                size={14}
                weight="700"
                style={{ wordBreak: 'break-all' }}
              >
                {functionArguments}
              </Text>
            </VStack>
          </Collapse>
        )
      }}
    />
  )
}

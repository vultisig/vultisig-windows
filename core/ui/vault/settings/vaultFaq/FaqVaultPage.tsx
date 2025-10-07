import { FlowPageHeader } from '@core/ui/flow/FlowPageHeader'
import CaretDownIcon from '@lib/ui/icons/CaretDownIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { vStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { motion, Transition } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { getFaqData } from './config'

const faqContentTransition: Transition = {
  duration: 0.3,
  ease: 'easeInOut',
}

type RowsOpenState = {
  [key: number]: boolean
}

export const FaqVaultPage = () => {
  const { t } = useTranslation()

  const faqData = getFaqData(t)

  const [rowsExpanded, setRowsExpanded] = useState<RowsOpenState>(
    faqData.reduce<RowsOpenState>((acc, { id }) => {
      acc[id] = false
      return acc
    }, {})
  )

  const toggleRow = (id: number) => {
    setRowsExpanded(prevState => ({
      ...prevState,
      [id]: !prevState[id],
    }))
  }

  return (
    <VStack flexGrow>
      <FlowPageHeader title={t('vault_rename_page_header_title')} />
      <PageContent>
        <RowsWrapper>
          {faqData.map(({ id, title, content }, idx) => {
            const isCurrentRowExpanded = rowsExpanded[id]

            return (
              <>
                <RowWrapper
                  tabIndex={0}
                  role="button"
                  key={id}
                  onClick={() => toggleRow(id)}
                >
                  <HStack justifyContent="space-between" alignItems="center">
                    <FAQQuestion size={14} color="shyExtra" weight="600">
                      {title}
                    </FAQQuestion>
                    <motion.div
                      animate={{ rotate: isCurrentRowExpanded ? 180 : 0 }}
                      transition={faqContentTransition}
                    >
                      <IconWrapper size={16} color="textSupporting">
                        <CaretDownIcon />
                      </IconWrapper>
                    </motion.div>
                  </HStack>
                  <motion.div
                    initial="collapsed"
                    animate={isCurrentRowExpanded ? 'expanded' : 'collapsed'}
                    variants={{
                      collapsed: { height: 0, opacity: 0, marginTop: 0 },
                      expanded: {
                        height: 'initial',
                        opacity: 1,
                        marginTop: 12,
                      },
                    }}
                    transition={faqContentTransition}
                  >
                    <FaqContent>
                      <Text size={13}>{content}</Text>
                    </FaqContent>
                  </motion.div>
                </RowWrapper>
                {idx < faqData.length - 1 && <Divider />}
              </>
            )
          })}
        </RowsWrapper>
      </PageContent>
    </VStack>
  )
}

const RowWrapper = styled.div`
  padding: 16px;
  ${vStack({
    gap: 4,
  })};
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background-color: ${getColor('foregroundExtra')};
  }
`

const FAQQuestion = styled(Text)`
  flex-grow: 1;
  line-height: 18px;
`

const FaqContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
`

const RowsWrapper = styled.div`
  border-radius: 12px;
  background-color: ${getColor('foreground')};

  & > ${RowWrapper}:first-of-type {
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }

  & > ${RowWrapper}:last-of-type {
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
  }
`

const Divider = styled.div`
  height: 1px;
  width: 100%;
  background: linear-gradient(90deg, #061b3a 0%, #284570 49.5%, #061b3a 100%);
`

import { SettingsBaselineText } from '@core/ui/settings/SettingsBaselineText'
import { SettingsFlushCard } from '@core/ui/settings/SettingsCard'
import { SettingsPageContent } from '@core/ui/settings/SettingsPageContent'
import { SettingsPageHeader } from '@core/ui/settings/SettingsPageHeader'
import { ChevronDownSmallIcon } from '@lib/ui/icons/ChevronDownSmallIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { hStack, VStack } from '@lib/ui/layout/Stack'
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
    <VStack fullHeight>
      <SettingsPageHeader title={t('faq')} />
      <SettingsPageContent flexGrow scrollable>
        <SettingsFlushCard>
          {faqData.map(({ id, title, content }) => {
            const isCurrentRowExpanded = rowsExpanded[id]

            return (
              <RowWrapper
                $isExpanded={isCurrentRowExpanded}
                tabIndex={0}
                role="button"
                key={id}
                onClick={() => toggleRow(id)}
              >
                <QuestionColumn>
                  <SettingsBaselineText
                    as="div"
                    color="shyExtra"
                    variant="stationBodyS"
                  >
                    {title}
                  </SettingsBaselineText>
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
                    style={{ overflow: 'hidden' }}
                  >
                    <SettingsBaselineText
                      as="div"
                      color="contrast"
                      variant="footnote"
                    >
                      {content}
                    </SettingsBaselineText>
                  </motion.div>
                </QuestionColumn>
                <motion.div
                  animate={{ rotate: isCurrentRowExpanded ? 180 : 0 }}
                  transition={faqContentTransition}
                  style={{ flexShrink: 0, lineHeight: 0 }}
                >
                  <IconWrapper size={16} color="textShy">
                    <ChevronDownSmallIcon />
                  </IconWrapper>
                </motion.div>
              </RowWrapper>
            )
          })}
        </SettingsFlushCard>
      </SettingsPageContent>
    </VStack>
  )
}

// A two-line question fills the 70 tall closed row only at 15, while the opened frame pads 16.
const RowWrapper = styled.div<{ $isExpanded: boolean }>`
  ${hStack({
    alignItems: 'center',
    gap: 12,
  })};
  background-color: ${getColor('foreground')};
  cursor: pointer;
  min-height: 70px;
  padding: ${({ $isExpanded }) => ($isExpanded ? 16 : 15)}px 20px;
  transition: all 0.3s;

  &:hover {
    background-color: ${getColor('foregroundExtra')};
  }
`

const QuestionColumn = styled.div`
  flex: 1;
  min-width: 0;
`

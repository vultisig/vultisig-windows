import CaretDownIcon from '@lib/ui/icons/CaretDownIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PageHeader } from '../../../ui/page/PageHeader'
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle'
import { PageSlice } from '../../../ui/page/PageSlice'
import { getFaqData } from './constants'
import {
  FaqButton,
  FaqContent,
  HorizontalLine,
  Row,
} from './FaqVaultPage.styles'

const faqContentTransition = {
  duration: 0.3,
  ease: 'easeInOut',
}

type RowsOpenState = {
  [key: number]: boolean
}

const FaqVaultPage = () => {
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
    <VStack flexGrow gap={16}>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={
          <PageHeaderTitle>
            {t('vault_rename_page_header_title')}
          </PageHeaderTitle>
        }
      />
      <PageSlice gap={16} flexGrow={true}>
        {faqData.map(({ id, title, content }) => {
          const isCurrentRowExpanded = rowsExpanded[id]

          return (
            <FaqButton key={id} onClick={() => toggleRow(id)}>
              <Row justifyContent="space-between" alignItems="center">
                <Text size={16} color="contrast" weight="600">
                  {title}
                </Text>
                <motion.div
                  animate={{ rotate: isCurrentRowExpanded ? 180 : 0 }}
                  transition={faqContentTransition}
                >
                  <CaretDownIcon />
                </motion.div>
              </Row>
              <motion.div
                initial="collapsed"
                animate={isCurrentRowExpanded ? 'expanded' : 'collapsed'}
                variants={{
                  collapsed: { height: 0, opacity: 0, marginTop: 0 },
                  expanded: { height: 'initial', opacity: 1, marginTop: 12 },
                }}
                transition={faqContentTransition}
              >
                <FaqContent>
                  <HorizontalLine />
                  <Text size={13} color="regular">
                    {content}
                  </Text>
                </FaqContent>
              </motion.div>
            </FaqButton>
          )
        })}
      </PageSlice>
    </VStack>
  )
}

export default FaqVaultPage

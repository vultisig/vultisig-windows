import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import {
  HomeDisplay,
  homeDisplays,
  useHomeDisplay,
  useSetHomeDisplayMutation,
} from '@core/ui/storage/homeDisplay'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const optionCopy = {
  separate: {
    title: 'home_display_separate_title',
    description: 'home_display_separate_description',
  },
  combined: {
    title: 'home_display_combined_title',
    description: 'home_display_combined_description',
  },
} as const satisfies Record<HomeDisplay, { title: string; description: string }>

/** Picks what the home header's balance shows, for every vault. */
export const HomeDisplayPage = () => {
  const { t } = useTranslation()
  const value = useHomeDisplay()
  const { mutate } = useSetHomeDisplayMutation()

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('home_display')}
        hasBorder
      />
      <PageContent flexGrow scrollable>
        <List>
          {homeDisplays.map(option => (
            <ListItem
              key={option}
              title={t(optionCopy[option].title)}
              description={t(optionCopy[option].description)}
              extra={
                <CircleCheckIcon
                  style={{
                    visibility: option === value ? 'visible' : 'hidden',
                  }}
                />
              }
              onClick={() => mutate(option)}
              hoverable
            />
          ))}
        </List>
      </PageContent>
    </VStack>
  )
}

const CircleCheckIcon = styled(CheckIcon)`
  flex-shrink: 0;
  background-color: ${getColor('buttonPrimary')};
  ${borderRadius.pill};
  font-size: 16px;
  padding: 2px;
`

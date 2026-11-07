import { SettingsBaselineText } from '@core/ui/settings/SettingsBaselineText'
import { SettingsBorderedCard } from '@core/ui/settings/SettingsCard'
import { SettingsPageHeader } from '@core/ui/settings/SettingsPageHeader'
import {
  HomeDisplay,
  homeDisplays,
  useHomeDisplay,
  useSetHomeDisplayMutation,
} from '@core/ui/storage/homeDisplay'
import { VaultSettingsContent } from '@core/ui/vault/settings/VaultSettingsContent'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { centerContent } from '@lib/ui/css/centerContent'
import { VStack } from '@lib/ui/layout/Stack'
import { ListItem } from '@lib/ui/list/item'
import { Text } from '@lib/ui/text'
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
      <SettingsPageHeader title={t('home_display')} />
      <VaultSettingsContent flexGrow gap={6} scrollable>
        <SettingsBaselineText
          as="div"
          color="shyExtra"
          height={1.5}
          size={16}
          weight={500}
        >
          {t('home_display_balance_caption')}
        </SettingsBaselineText>
        <SettingsBorderedCard>
          {homeDisplays.map(option => (
            <OptionRow
              key={option}
              title={
                <SettingsBaselineText
                  as="span"
                  color="regular"
                  height={1.5}
                  size={16}
                  weight={500}
                >
                  {t(optionCopy[option].title)}
                </SettingsBaselineText>
              }
              description={
                <Text as="span" color="shyExtra" variant="caption">
                  {t(optionCopy[option].description)}
                </Text>
              }
              extra={<Radio $isSelected={option === value} />}
              onClick={() => mutate(option)}
            />
          ))}
        </SettingsBorderedCard>
      </VaultSettingsContent>
    </VStack>
  )
}

const OptionRow = styled(ListItem)`
  gap: 14px;
  padding: 14px;

  &:not(:last-child) {
    padding-bottom: 15px;
  }

  > :first-child {
    flex: 1;
    min-width: 0;
  }

  > :nth-child(2) {
    flex-shrink: 0;
  }
`

const Radio = styled.span<{ $isSelected: boolean }>`
  ${borderRadius.pill};
  ${centerContent};
  border: ${({ $isSelected }) => ($isSelected ? 1.5 : 1)}px solid
    ${({ $isSelected }) =>
      getColor($isSelected ? 'primaryAccentFour' : 'foregroundSuper')};
  box-sizing: border-box;
  flex-shrink: 0;
  height: 20px;
  width: 20px;

  &::after {
    ${borderRadius.pill};
    background: ${getColor('primaryAccentFour')};
    content: '';
    display: ${({ $isSelected }) => ($isSelected ? 'block' : 'none')};
    height: 12px;
    width: 12px;
  }
`

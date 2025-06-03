import { centerContent } from '@lib/ui/css/centerContent'
import { round } from '@lib/ui/css/round'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { FlowPageHeader } from '@lib/ui/flow/FlowPageHeader'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { FitPageContent } from '@lib/ui/page/PageContent'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import {
  passcodeAutoLockDurations,
  PasscodeAutoLockValue,
  usePasscodeAutoLock,
} from '../../storage/passcodeAutoLock'
import { useSetPasscodeAutoLockMutation } from './mutations/setPasscodeAutoLock'

const IconContainer = styled.div`
  ${round};
  ${sameDimensions(24)};
  ${centerContent};
  background-color: ${getColor('primary')};
  color: ${getColor('background')};
  font-size: 16px;
`

export const PasscodeAutoLockPage = () => {
  const { t } = useTranslation()
  const currentValue = usePasscodeAutoLock()
  const { mutate: setAutoLock } = useSetPasscodeAutoLockMutation()

  const handleOptionSelect = (value: PasscodeAutoLockValue) => {
    setAutoLock(value)
  }

  const options = [
    ...passcodeAutoLockDurations.map(duration => ({
      value: duration,
      label: t('minute', { count: duration }),
    })),
    { value: null, label: t('never') },
  ]

  return (
    <VStack fullHeight>
      <FlowPageHeader title={t('lock_time')} />
      <FitPageContent contentMaxWidth={360}>
        <VStack gap={24}>
          <VStack gap={4}>
            <Text size={16} color="contrast">
              {t('lock_vultisig_automatically_after')}
            </Text>
          </VStack>
          <List>
            {options.map(({ value, label }) => {
              const isSelected = value === currentValue

              return (
                <ListItem
                  key={label}
                  title={label}
                  onClick={() => handleOptionSelect(value)}
                  extra={
                    isSelected && (
                      <IconContainer>
                        <CheckIcon />
                      </IconContainer>
                    )
                  }
                  hoverable
                />
              )
            })}
          </List>
        </VStack>
      </FitPageContent>
    </VStack>
  )
}

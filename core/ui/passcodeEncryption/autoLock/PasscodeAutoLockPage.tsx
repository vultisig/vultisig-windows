import { useSetPasscodeAutoLockMutation } from '@core/ui/passcodeEncryption/autoLock/mutations/setPasscodeAutoLock'
import { settingsFieldSurface } from '@core/ui/settings/settingsField'
import { SettingsPageContent } from '@core/ui/settings/SettingsPageContent'
import { SettingsPageHeader } from '@core/ui/settings/SettingsPageHeader'
import {
  passcodeAutoLockOptions,
  PasscodeAutoLockValue,
  usePasscodeAutoLock,
} from '@core/ui/storage/passcodeAutoLock'
import { RadioOptionsList } from '@lib/ui/inputs/RadioOptionsList'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const Content = styled(SettingsPageContent)`
  padding-top: 12px;
`

const Options = styled.div`
  label {
    ${settingsFieldSurface};
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    min-height: 52px;
  }
`

/** The Lock Time page: how long the app stays unlocked while idle. */
export const PasscodeAutoLockPage = () => {
  const { t } = useTranslation()
  const { mutate: setAutoLock } = useSetPasscodeAutoLockMutation()
  const currentValue = usePasscodeAutoLock()

  const handleOptionSelect = (value: PasscodeAutoLockValue) => {
    setAutoLock(value)
  }

  return (
    <VStack fullHeight>
      <SettingsPageHeader title={t('lock_time')} />
      <Content flexGrow gap={8} scrollable>
        <Text color="shyExtra" variant="footnote">
          {t('lock_vultisig_automatically_after')}
        </Text>
        <Options>
          <RadioOptionsList<PasscodeAutoLockValue>
            value={currentValue}
            onChange={handleOptionSelect}
            options={passcodeAutoLockOptions}
            renderOption={value =>
              value === null ? t('never') : t('minute', { count: value })
            }
          />
        </Options>
      </Content>
    </VStack>
  )
}

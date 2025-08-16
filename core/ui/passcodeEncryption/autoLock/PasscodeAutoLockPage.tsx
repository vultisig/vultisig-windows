import { FlowPageHeader } from '@core/ui/flow/FlowPageHeader'
import { useSetPasscodeAutoLockMutation } from '@core/ui/passcodeEncryption/autoLock/mutations/setPasscodeAutoLock'
import {
  passcodeAutoLockOptions,
  PasscodeAutoLockValue,
  usePasscodeAutoLock,
} from '@core/ui/storage/passcodeAutoLock'
import { RadioOptionsList } from '@lib/ui/inputs/RadioOptionsList'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

export const PasscodeAutoLockPage = () => {
  const { t } = useTranslation()
  const { mutate: setAutoLock } = useSetPasscodeAutoLockMutation()
  const currentValue = usePasscodeAutoLock()

  const handleOptionSelect = (value: PasscodeAutoLockValue) => {
    setAutoLock(value)
  }

  return (
    <VStack fullHeight>
      <FlowPageHeader title={t('lock_time')} />
      <PageContent alignItems="center" flexGrow scrollable>
        <VStack gap={8}>
          <Text size={14} color="contrast">
            {t('lock_vultisig_automatically_after')}
          </Text>
          <RadioOptionsList<PasscodeAutoLockValue>
            value={currentValue}
            onChange={handleOptionSelect}
            options={passcodeAutoLockOptions}
            renderOption={value =>
              value === null ? t('never') : t('minute', { count: value })
            }
          />
        </VStack>
      </PageContent>
    </VStack>
  )
}

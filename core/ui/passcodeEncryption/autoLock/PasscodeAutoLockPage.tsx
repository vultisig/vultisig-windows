import { FlowPageHeader } from '@lib/ui/flow/FlowPageHeader'
import { RadioOptionsList } from '@lib/ui/inputs/RadioOptionsList'
import { VStack } from '@lib/ui/layout/Stack'
import { FitPageContent } from '@lib/ui/page/PageContent'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import {
  passcodeAutoLockOptions,
  PasscodeAutoLockValue,
  usePasscodeAutoLock,
} from '../../storage/passcodeAutoLock'
import { useSetPasscodeAutoLockMutation } from './mutations/setPasscodeAutoLock'

export const PasscodeAutoLockPage = () => {
  const { t } = useTranslation()
  const currentValue = usePasscodeAutoLock()
  const { mutate: setAutoLock } = useSetPasscodeAutoLockMutation()

  const handleOptionSelect = (value: PasscodeAutoLockValue) => {
    setAutoLock(value)
  }

  return (
    <VStack fullHeight>
      <FlowPageHeader title={t('lock_time')} />
      <FitPageContent contentMaxWidth={360}>
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
      </FitPageContent>
    </VStack>
  )
}

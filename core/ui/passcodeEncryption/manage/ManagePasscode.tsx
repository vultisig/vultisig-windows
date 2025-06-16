import { VStack } from '@lib/ui/layout/Stack'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useTranslation } from 'react-i18next'

import { useDisablePasscodeMutation } from '../mutations/useDisablePasscodeMutation'
import { ChangePasscode } from './change/ChangePasscode'
import { EnablePasscodeInput } from './EnablePasscodeInput'

export const ManagePasscode = () => {
  const {
    mutate: disablePasscodeMutation,
    isPending,
    error,
  } = useDisablePasscodeMutation()

  const { t } = useTranslation()

  return (
    <VStack gap={22}>
      <EnablePasscodeInput
        value={true}
        onChange={() => disablePasscodeMutation()}
        pendingMessage={isPending ? t('decrypting_vault_keyshares') : undefined}
        errorMessage={error ? extractErrorMsg(error) : undefined}
      />
      {!isPending && <ChangePasscode />}
    </VStack>
  )
}

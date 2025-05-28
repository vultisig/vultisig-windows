import { Text } from '@lib/ui/text'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useTranslation } from 'react-i18next'

import { useDisablePasscodeMutation } from '../mutations/useDisablePasscodeMutation'
import { EnablePasscodeInput } from './EnablePasscodeInput'

export const ManagePasscode = () => {
  const {
    mutate: disablePasscodeMutation,
    isPending,
    error,
  } = useDisablePasscodeMutation()

  const { t } = useTranslation()

  return (
    <>
      <EnablePasscodeInput
        value={true}
        onChange={() => disablePasscodeMutation()}
        pendingMessage={isPending ? t('decrypting_vault_keyshares') : undefined}
        errorMessage={error ? extractErrorMsg(error) : undefined}
      />
      <Text>manage passcode...</Text>
    </>
  )
}

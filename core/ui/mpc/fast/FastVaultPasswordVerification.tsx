import { getVaultFromServer } from '@core/mpc/fast/api/getVaultFromServer'
import { getVaultId } from '@core/mpc/vault/Vault'
import { useUpdateVaultMutation } from '@core/ui/vault/mutations/useUpdateVaultMutation'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Button } from '@lib/ui/buttons/Button'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { CrossIcon } from '@lib/ui/icons/CrossIcon'
import { FocusLockIcon } from '@lib/ui/icons/FocusLockIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { PasswordInput } from '@lib/ui/inputs/PasswordInput'
import { VStack } from '@lib/ui/layout/Stack'
import { Backdrop } from '@lib/ui/modal/Backdrop'
import { Text } from '@lib/ui/text'
import { convertDuration } from '@lib/utils/time/convertDuration'
import { useMutation } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const verificationTimeoutMs = convertDuration(15, 'd', 'ms')

export const FastVaultPasswordVerification = () => {
  const [password, setPassword] = useState('')

  const { t } = useTranslation()
  const vault = useCurrentVault()
  const { lastPasswordVerificationTime } = vault
  const vaultId = getVaultId(vault)
  const { mutateAsync: updateVault } = useUpdateVaultMutation()

  const { mutate, error, isPending } = useMutation({
    mutationFn: async (password?: string) => {
      if (password) {
        await getVaultFromServer({
          vaultId: vaultId,
          password,
        })
      }
      await updateVault({
        vaultId,
        fields: {
          lastPasswordVerificationTime: Date.now(),
        },
      })
    },
  })

  const now = Date.now()

  const shouldShowModal =
    !lastPasswordVerificationTime ||
    now - lastPasswordVerificationTime > verificationTimeoutMs

  const isDisabled = useMemo(() => {
    if (!password) {
      return t('password_required')
    }
  }, [password, t])

  if (!shouldShowModal) return null

  return (
    <Backdrop onClose={() => mutate(undefined)}>
      <ModalWrapper>
        <CloseButton kind="action" onClick={() => mutate(undefined)}>
          <CrossIcon />
        </CloseButton>

        <IconWrapper size={32} color="buttonPrimary">
          <FocusLockIcon />
        </IconWrapper>

        <VStack gap={4} alignItems="center">
          <Text size={16} weight={500} centerHorizontally>
            {t('enter_your_password')}
          </Text>
          <Text size={12} weight={400} color="shy" centerHorizontally>
            {t('verify_password_periodic_message_description')}
          </Text>
        </VStack>

        <VStack gap={16} fullWidth>
          <PasswordInput
            placeholder={t('enter_password')}
            value={password}
            onValueChange={value => {
              if (isPending) return
              setPassword(value)
            }}
            validation={error ? 'invalid' : undefined}
            error={error ? t('incorrect_password') : undefined}
          />

          <ConfirmButton
            disabled={isDisabled || isPending}
            loading={isPending}
            onClick={() => mutate(password)}
            kind="primary"
          >
            {t('confirm')}
          </ConfirmButton>
        </VStack>
      </ModalWrapper>
    </Backdrop>
  )
}

const CloseButton = styled(IconButton)`
  display: flex;
  width: 40px;
  height: 40px;
  padding: 12px;
  justify-content: center;
  align-items: center;
  border-radius: 77px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);

  position: absolute;
  right: 6px;
  top: 6px;
`

const ModalWrapper = styled(VStack)`
  position: relative;
  display: flex;
  width: 311px;
  padding: 32px 24px 24px 24px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 24px;
  border-radius: 24px;
  border: 1px solid #11284a;
  background: #02122b;
`

const ConfirmButton = styled(Button)`
  width: 100%;
  height: 48px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
`

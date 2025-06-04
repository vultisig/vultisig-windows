import { getVaultFromServer } from '@core/mpc/fast/api/getVaultFromServer'
import { useUpdateVaultMutation } from '@core/ui/vault/mutations/useUpdateVaultMutation'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { getVaultId } from '@core/ui/vault/Vault'
import { Button } from '@lib/ui/buttons/Button'
import { PasswordInput } from '@lib/ui/inputs/PasswordInput'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { convertDuration } from '@lib/utils/time/convertDuration'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const verificationTimeoutMs = convertDuration(15, 'd', 'ms')

export const FastVaultPasswordVerification = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [password, setPassword] = useState('')

  const { t } = useTranslation()
  const vault = useCurrentVault()
  const { lastPasswordVerificationTime } = vault
  const vaultId = getVaultId(vault)
  const { mutate: updateVault } = useUpdateVaultMutation()

  const { mutate, error, isPending } = useMutation({
    mutationFn: async () =>
      getVaultFromServer({
        vaultId: vaultId,
        password,
      }),
    onSuccess: () => {
      updateVault({
        vaultId,
        fields: {
          lastPasswordVerificationTime: Date.now(),
        },
      })
      setIsOpen(false)
    },
  })

  useEffect(() => {
    const now = Date.now()

    if (
      !lastPasswordVerificationTime ||
      now - lastPasswordVerificationTime > verificationTimeoutMs
    ) {
      setIsOpen(true)
    }
  }, [lastPasswordVerificationTime])

  const isDisabled = useMemo(() => {
    if (!password) {
      return t('password_required')
    }
  }, [password, t])

  if (!isOpen) return null

  return (
    <StyledModal
      title={t('verify_password_periodic_message')}
      onClose={() => setIsOpen(false)}
    >
      <VStack gap={16}>
        <PasswordInput
          placeholder={t('enter_password')}
          value={password}
          onValueChange={value => {
            if (isPending) return
            setPassword(value)
          }}
        />
        <VStack gap={6}>
          <Button
            disabled={!!isDisabled || isPending}
            loading={isPending}
            onClick={() => mutate()}
          >
            {t('verify')}
          </Button>
          {error && (
            <Text size={12} color="danger">
              {t('incorrect_password')}
            </Text>
          )}
        </VStack>
      </VStack>
    </StyledModal>
  )
}

const StyledModal = styled(Modal)`
  background-color: ${getColor('background')};
  border: none;
`

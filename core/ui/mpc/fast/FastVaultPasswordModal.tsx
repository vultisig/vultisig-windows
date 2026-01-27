import { passwordLengthConfig } from '@core/config/password'
import { getVaultFromServer } from '@core/mpc/fast/api/getVaultFromServer'
import { getVaultId } from '@core/mpc/vault/Vault'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@lib/ui/buttons/Button'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { CrossIcon } from '@lib/ui/icons/CrossIcon'
import { FocusLockIcon } from '@lib/ui/icons/FocusLockIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { PasswordInput } from '@lib/ui/inputs/PasswordInput'
import { VStack } from '@lib/ui/layout/Stack'
import { Backdrop } from '@lib/ui/modal/Backdrop'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useMutation } from '@tanstack/react-query'
import { TFunction } from 'i18next'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { z } from 'zod'

const createSchema = (t: TFunction) => {
  const message = t('password_pattern_error', passwordLengthConfig)

  return z.object({
    password: z
      .string()
      .min(passwordLengthConfig.min, message)
      .max(passwordLengthConfig.max, message),
  })
}

type Schema = z.infer<ReturnType<typeof createSchema>>

type FastVaultPasswordModalProps = OnBackProp &
  OnFinishProp<{
    password: string
  }> & {
    title?: string
    description: string
    showModal?: boolean
  }

export const FastVaultPasswordModal: React.FC<FastVaultPasswordModalProps> = ({
  showModal,
  onFinish,
  onBack,
  title,
  description,
}) => {
  const { t } = useTranslation()
  const vault = useCurrentVault()
  const schema = useMemo(() => createSchema(t), [t])
  const {
    error: mutationError,
    isPending: mutationIsPending,
    mutate,
  } = useMutation({
    mutationFn: getVaultFromServer,
    onSuccess: onFinish,
  })

  const {
    formState: { errors, isValid },
    handleSubmit,
    register,
  } = useForm<Schema>({
    mode: 'onChange',
    resolver: zodResolver(schema),
  })

  const onSubmit = ({ password }: Schema) => {
    mutate({ vaultId: getVaultId(vault), password })
  }

  const passwordErrorMessage = useMemo(() => {
    if (mutationError) {
      return t('incorrect_password')
    }

    return errors.password?.message
  }, [mutationError, errors.password, t])

  return showModal ? (
    <Backdrop onClose={onBack}>
      <ModalWrapper>
        <CloseButton onClick={onBack}>
          <CrossIcon />
        </CloseButton>

        <IconWrapper size={32} color="buttonPrimary">
          <FocusLockIcon />
        </IconWrapper>

        <VStack gap={8} alignItems="center">
          <Text size={17} weight={500} centerHorizontally>
            {title ?? t('enter_your_password')}
          </Text>
          <Text size={12} color="shy" centerHorizontally>
            {description}
          </Text>
        </VStack>

        <VStack as="form" onSubmit={handleSubmit(onSubmit)} gap={16} fullWidth>
          <PasswordInput
            {...register('password')}
            autoFocus
            placeholder={t('enter_password')}
            validation={passwordErrorMessage ? 'invalid' : undefined}
            error={passwordErrorMessage}
          />

          <ConfirmButton
            disabled={mutationIsPending || !isValid}
            loading={mutationIsPending}
            type="submit"
            kind="primary"
          >
            {t('confirm')}
          </ConfirmButton>
        </VStack>
      </ModalWrapper>
    </Backdrop>
  ) : null
}

const CloseButton = styled(IconButton)`
  display: flex;
  padding: 8px;
  align-items: center;
  gap: 10px;

  position: absolute;
  right: 12px;
  top: 12px;
  border-radius: 99px;
  background: ${getColor('foregroundExtra')};
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

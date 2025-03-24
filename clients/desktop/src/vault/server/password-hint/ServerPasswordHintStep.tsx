import { zodResolver } from '@hookform/resolvers/zod'
import { OnBackProp, OnForwardProp } from '@lib/ui/props'
import type { TFunction } from 'i18next'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { z } from 'zod'

import { ActionInsideInteractiveElement } from '../../../lib/ui/base/ActionInsideInteractiveElement'
import { Button } from '../../../lib/ui/buttons/Button'
import { iconButtonIconSizeRecord } from '../../../lib/ui/buttons/IconButton'
import { UnstyledButton } from '../../../lib/ui/buttons/UnstyledButton'
import {
  textInputHeight,
  textInputHorizontalPadding,
} from '../../../lib/ui/css/textInput'
import { CircledCloseIcon } from '../../../lib/ui/icons/CircledCloseIcon'
import { TextInput } from '../../../lib/ui/inputs/TextInput'
import { HStack, VStack } from '../../../lib/ui/layout/Stack'
import { Text } from '../../../lib/ui/text'
import { PageContent } from '../../../ui/page/PageContent'
import { PageHeader } from '../../../ui/page/PageHeader'
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton'
import { useVaultPasswordHint } from './state/password-hint'

const getPasswordHintSchema = (t: TFunction) =>
  z.object({
    passwordHint: z.string().min(1, { message: t('fastVaultSetup.hintEmpty') }),
  })

type PasswordHintSchema = z.infer<ReturnType<typeof getPasswordHintSchema>>

export const ServerPasswordHintStep = ({
  onForward,
  onBack,
}: OnForwardProp & Partial<OnBackProp>) => {
  const { t } = useTranslation()
  const [storedPasswordHint, setStoredPasswordHint] = useVaultPasswordHint()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<PasswordHintSchema>({
    resolver: zodResolver(getPasswordHintSchema(t)),
    defaultValues: {
      passwordHint: storedPasswordHint || '',
    },
    mode: 'onChange',
  })

  const onSubmit = (data: PasswordHintSchema) => {
    setStoredPasswordHint(data.passwordHint)
    onForward()
  }

  return (
    <>
      <PageHeader primaryControls={<PageHeaderBackButton onClick={onBack} />} />
      <PageContent as="form" onSubmit={handleSubmit(onSubmit)}>
        <VStack flexGrow gap={16}>
          <VStack>
            <Text variant="h1Regular">
              {t('fastVaultSetup.addOptionalHint')}
            </Text>
            <Text size={14} color="shy">
              {t('fastVaultSetup.hintDescription')}
            </Text>
          </VStack>
          <VStack gap={4}>
            <ActionInsideInteractiveElement
              render={() => (
                <TextInput
                  {...register('passwordHint')}
                  validation={
                    isValid
                      ? 'valid'
                      : errors.passwordHint
                        ? 'invalid'
                        : undefined
                  }
                  placeholder={t('fastVaultSetup.enterHint')}
                  autoFocus
                  onValueChange={value => setValue('passwordHint', value)}
                />
              )}
              action={
                <UnstyledButton onClick={() => setValue('passwordHint', '')}>
                  <CircledCloseIcon />
                </UnstyledButton>
              }
              actionPlacerStyles={{
                right: textInputHorizontalPadding,
                bottom: (textInputHeight - iconButtonIconSizeRecord.l) / 2,
              }}
            />
            {errors.passwordHint && errors.passwordHint.message && (
              <Text color="danger" size={12}>
                {errors.passwordHint.message}
              </Text>
            )}
          </VStack>
        </VStack>
        <ButtonsWrapper fullWidth gap={8}>
          <StyledButton
            type="button"
            kind="secondary"
            onClick={() => onForward()}
          >
            {t('skip')}
          </StyledButton>
          <StyledButton type="submit" isDisabled={!!errors.passwordHint}>
            {t('next')}
          </StyledButton>
        </ButtonsWrapper>
      </PageContent>
    </>
  )
}

const ButtonsWrapper = styled(HStack)`
  align-self: center;
`

const StyledButton = styled(Button)`
  flex: 1;
`

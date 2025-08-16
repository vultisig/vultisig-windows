import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { usePasswordHint } from '@core/ui/mpc/keygen/create/fast/server/password-hint/state/password-hint'
import { zodResolver } from '@hookform/resolvers/zod'
import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { Button } from '@lib/ui/buttons/Button'
import { IconButton, iconButtonSize } from '@lib/ui/buttons/IconButton'
import {
  textInputHeight,
  textInputHorizontalPadding,
} from '@lib/ui/css/textInput'
import { CircleCrossIcon } from '@lib/ui/icons/CircleCrossIcon'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { TFunction } from 'i18next'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

const getPasswordHintSchema = (t: TFunction) =>
  z.object({
    passwordHint: z.string().min(1, { message: t('fastVaultSetup.hintEmpty') }),
  })

type PasswordHintSchema = z.infer<ReturnType<typeof getPasswordHintSchema>>

export const ServerPasswordHintStep = ({
  onFinish,
  onBack,
}: OnFinishProp & Partial<OnBackProp>) => {
  const { t } = useTranslation()
  const [storedPasswordHint, setStoredPasswordHint] = usePasswordHint()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<PasswordHintSchema>({
    defaultValues: { passwordHint: storedPasswordHint || '' },
    mode: 'onChange',
    resolver: zodResolver(getPasswordHintSchema(t)),
  })

  const onSubmit = (data: PasswordHintSchema) => {
    setStoredPasswordHint(data.passwordHint)
    onFinish()
  }

  return (
    <VStack as="form" onSubmit={handleSubmit(onSubmit)} fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        title={t('fastVaultSetup.addOptionalHint')}
        hasBorder
      />
      <PageContent gap={8} flexGrow scrollable>
        <Text color="shy" size={14}>
          {t('fastVaultSetup.hintDescription')}
        </Text>
        <ActionInsideInteractiveElement
          render={() => (
            <TextInput
              {...register('passwordHint')}
              onValueChange={value => setValue('passwordHint', value)}
              placeholder={t('fastVaultSetup.enterHint')}
              validation={
                isValid ? 'valid' : errors.passwordHint ? 'invalid' : undefined
              }
              autoFocus
            />
          )}
          action={
            <IconButton onClick={() => setValue('passwordHint', '')}>
              <CircleCrossIcon />
            </IconButton>
          }
          actionPlacerStyles={{
            bottom: (textInputHeight - iconButtonSize.md) / 2,
            right: textInputHorizontalPadding,
          }}
        />
        {errors.passwordHint && errors.passwordHint.message && (
          <Text color="danger" size={12}>
            {errors.passwordHint.message}
          </Text>
        )}
      </PageContent>
      <PageFooter>
        <HStack gap={8}>
          <Button kind="secondary" onClick={() => onFinish()}>
            {t('skip')}
          </Button>
          <Button disabled={errors.passwordHint?.message} type="submit">
            {t('next')}
          </Button>
        </HStack>
      </PageFooter>
    </VStack>
  )
}

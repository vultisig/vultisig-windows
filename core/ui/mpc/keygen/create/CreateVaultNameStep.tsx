import { useVaultName } from '@core/ui/mpc/keygen/create/state/vaultName'
import { KeygenEducationPrompt } from '@core/ui/mpc/keygen/education/KeygenEducationPrompt'
import { useVaultNames } from '@core/ui/vault/state/vaults'
import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { Button } from '@lib/ui/buttons/Button'
import { iconButtonIconSizeRecord } from '@lib/ui/buttons/IconButton'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import {
  textInputHeight,
  textInputHorizontalPadding,
} from '@lib/ui/css/textInput'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { CircledCloseIcon } from '@lib/ui/icons/CircledCloseIcon'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const maxVaultNameLength = 50

export const CreateVaultNameStep = ({
  onFinish,
  onBack,
}: OnFinishProp & Partial<OnBackProp>) => {
  const { t } = useTranslation()
  const existingVaultNames = useVaultNames()
  const [name, setName] = useVaultName()

  const isDisabled = useMemo(() => {
    if (!name) {
      return t('vault_name_required')
    }

    if (existingVaultNames.includes(name)) {
      return t('vault_name_already_exists')
    }

    if (name.length > maxVaultNameLength) {
      return t('vault_name_max_length_error')
    }
  }, [existingVaultNames, name, t])

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        secondaryControls={<KeygenEducationPrompt />}
      />
      <PageContent
        as="form"
        {...getFormProps({ onSubmit: onFinish, isDisabled })}
        justifyContent="space-between"
        flexGrow
      >
        <VStack gap={16}>
          <VStack>
            <Text variant="h1Regular">{t('name_your_vault')}</Text>
            <Text size={14} color="shy">
              {t('vault_name_description')}
            </Text>
          </VStack>
          <VStack flexGrow gap={4}>
            <ActionInsideInteractiveElement
              render={() => (
                <TextInput
                  placeholder={t('enter_vault_name')}
                  value={name}
                  onValueChange={setName}
                  autoFocus
                />
              )}
              action={
                <UnstyledButton onClick={() => setName('')}>
                  <CircledCloseIcon />
                </UnstyledButton>
              }
              actionPlacerStyles={{
                right: textInputHorizontalPadding,
                bottom: (textInputHeight - iconButtonIconSizeRecord.l) / 2,
              }}
            />
          </VStack>
        </VStack>
        <Button type="submit" isDisabled={isDisabled}>
          {t('next')}
        </Button>
      </PageContent>
    </>
  )
}

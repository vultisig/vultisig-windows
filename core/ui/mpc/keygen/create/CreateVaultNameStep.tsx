import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useVaultName } from '@core/ui/mpc/keygen/create/state/vaultName'
import { KeygenEducationPrompt } from '@core/ui/mpc/keygen/education/KeygenEducationPrompt'
import { useVaultNames } from '@core/ui/storage/vaults'
import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { Button } from '@lib/ui/buttons/Button'
import { IconButton, iconButtonSize } from '@lib/ui/buttons/IconButton'
import {
  textInputHeight,
  textInputHorizontalPadding,
} from '@lib/ui/css/textInput'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { CircleCrossIcon } from '@lib/ui/icons/CircleCrossIcon'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
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
    <VStack
      as="form"
      {...getFormProps({ onSubmit: onFinish, isDisabled })}
      fullHeight
    >
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        secondaryControls={<KeygenEducationPrompt />}
        title={t('name_your_vault')}
        hasBorder
      />
      <PageContent gap={8} flexGrow scrollable>
        <Text color="shy" size={14}>
          {t('vault_name_description')}
        </Text>
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
            <IconButton onClick={() => setName('')}>
              <CircleCrossIcon />
            </IconButton>
          }
          actionPlacerStyles={{
            bottom: (textInputHeight - iconButtonSize.md) / 2,
            right: textInputHorizontalPadding,
          }}
        />
      </PageContent>
      <PageFooter>
        <Button disabled={isDisabled} type="submit">
          {t('next')}
        </Button>
      </PageFooter>
    </VStack>
  )
}

import { Button } from '@clients/extension/src/components/button'
import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import { useUpdateVaultMutation } from '@core/ui/vault/mutations/useUpdateVaultMutation'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { getVaultId } from '@core/ui/vault/Vault'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface InitialState {
  name?: string
}

export const RenameVaultPage = () => {
  const { t } = useTranslation()
  const initialState: InitialState = {}
  const [state, setState] = useState(initialState)
  const { name } = state
  const navigate = useAppNavigate()
  const currentVault = useCurrentVault()
  const updateVault = useUpdateVaultMutation()

  const handleChange = (name?: string) => {
    setState(prevState => ({ ...prevState, name }))
  }

  const handleSubmit = (): void => {
    if (!updateVault.isPending && name?.trim()) {
      updateVault
        .mutateAsync({
          vaultId: getVaultId(currentVault),
          fields: { name: name },
        })
        .then(() => navigate('settings'))
    }
  }

  useEffect(() => {
    setState(prevState => ({ ...prevState, name: currentVault.name }))
  }, [currentVault.name])

  return (
    <VStack fullHeight>
      <PageHeader
        hasBorder
        primaryControls={
          <Button onClick={() => navigate('vaultSettings')} ghost>
            <ChevronLeftIcon fontSize={20} />
          </Button>
        }
        title={
          <Text color="contrast" size={18} weight={500}>
            {t('rename_vault')}
          </Text>
        }
      />
      <PageContent gap={24} flexGrow scrollable>
        {/* TODO: Update search input styles based on Figma */}
        <TextInput value={name} onValueChange={handleChange} />
      </PageContent>
      <PageFooter>
        <Button
          loading={updateVault.isPending}
          onClick={handleSubmit}
          shape="round"
          size="large"
          type="primary"
          block
        >
          {t('save')}
        </Button>
      </PageFooter>
    </VStack>
  )
}

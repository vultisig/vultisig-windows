import { getVaultId } from '@core/mpc/vault/Vault'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import {
  useCreateVaultFolderMutation,
  useVaultFolders,
} from '@core/ui/storage/vaultFolders'
import { useFolderlessVaults } from '@core/ui/storage/vaults'
import { DoneButton } from '@core/ui/vault/chain/manage/shared/DoneButton'
import { VaultSigners } from '@core/ui/vault/signers'
import {
  LeadingIconBadge,
  VaultListRow,
} from '@core/ui/vaultsOrganisation/components'
import { useVaultsTotalBalances } from '@core/ui/vaultsOrganisation/hooks/useVaultsTotalBalances'
import { getVaultSecurityTone } from '@core/ui/vaultsOrganisation/utils/getVaultSecurityTone'
import { Button } from '@lib/ui/buttons/Button'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { CloseIcon } from '@lib/ui/icons/CloseIcon'
import { FolderLockIcon } from '@lib/ui/icons/FolderLockIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { Switch } from '@lib/ui/inputs/switch'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { getLastItemOrder } from '@lib/utils/order/getLastItemOrder'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCore } from '../../../state/core'

export const CreateVaultFolderPage = () => {
  const { t } = useTranslation()
  const { mutate, isPending } = useCreateVaultFolderMutation()
  const [name, setName] = useState<string>('')
  const [vaultIds, setVaultIds] = useState<string[]>([])
  const [touched, setTouched] = useState(false)
  const { goBack } = useCore()
  const folders = useVaultFolders()
  const vaults = useFolderlessVaults()
  const { totals: vaultTotals, isPending: isTotalsPending } =
    useVaultsTotalBalances()
  const formatFiatAmount = useFormatFiatAmount()

  const names = useMemo(() => folders.map(({ name }) => name), [folders])

  const validationMessage = useMemo(() => {
    if (!name) return t('folder_name_required')

    if (names.includes(name)) return t('folder_name_already_exists')

    return null
  }, [name, t, names])

  const toggleVault = (vaultId: string) => {
    setVaultIds(prevVaultIds =>
      prevVaultIds.includes(vaultId)
        ? prevVaultIds.filter(id => id !== vaultId)
        : [...prevVaultIds, vaultId]
    )
  }

  return (
    <Container
      as="form"
      {...getFormProps({
        isDisabled: validationMessage ?? undefined,
        isPending,
        onSubmit: () =>
          mutate(
            {
              name,
              order: getLastItemOrder(folders.map(({ order }) => order)),
              vaultIds,
            },
            { onSuccess: goBack }
          ),
      })}
      fullHeight
    >
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={goBack} />}
        secondaryControls={<DoneButton onClick={goBack} />}
        title={t('create_folder')}
      />
      <PageContent gap={28} scrollable flexGrow>
        <VStack gap={8}>
          <StyledTextInput
            label={t('folder_name')}
            onValueChange={setName}
            placeholder={t('enter_folder_name')}
            value={name}
            validation={validationMessage ? 'invalid' : undefined}
            inputOverlay={
              name ? (
                <InputOverlay>
                  <IconButton
                    kind="link"
                    size="sm"
                    onClick={() => setName('')}
                    aria-label={t('clear')}
                  >
                    <CloseIcon />
                  </IconButton>
                </InputOverlay>
              ) : null
            }
          />
          {validationMessage && (
            <Text size={12} color="danger">
              {validationMessage}
            </Text>
          )}
        </VStack>

        <VStack gap={16}>
          <Text
            size={13}
            weight={600}
            color="shy"
            style={{ textTransform: 'uppercase' }}
          >
            {t('add_vaults_to_folder')}
          </Text>
          {vaults.length ? (
            <StyledList>
              {vaults.map(vault => {
                const vaultId = getVaultId(vault)
                const checked = vaultIds.includes(vaultId)
                const { tone, icon } = getVaultSecurityTone(vault)
                const value = vaultTotals?.[vaultId]

                return (
                  <VaultListRow
                    key={vaultId}
                    leading={
                      <LeadingIconBadge tone={tone}>{icon}</LeadingIconBadge>
                    }
                    title={vault.name}
                    subtitle={
                      !isTotalsPending && value !== undefined
                        ? formatFiatAmount(value)
                        : undefined
                    }
                    meta={<VaultSigners vault={vault} />}
                    trailing={
                      <SwitchWrapper
                        onClick={event => event.stopPropagation()}
                        role="presentation"
                      >
                        <Switch
                          checked={checked}
                          onChange={() => toggleVault(vaultId)}
                        />
                      </SwitchWrapper>
                    }
                    selected={checked}
                    dimmed={!checked}
                    onClick={() => toggleVault(vaultId)}
                  />
                )
              })}
            </StyledList>
          ) : (
            <EmptyStateCard gap={12} alignItems="center">
              <IconWrapper size={28} color="textShy">
                <FolderLockIcon />
              </IconWrapper>
              <VStack gap={4}>
                <Text size={16} weight={600} centerHorizontally>
                  {t('nothing_to_add')}
                </Text>
                <Text size={13} color="shy" centerHorizontally>
                  {t('nothing_to_add_hint')}
                </Text>
              </VStack>
            </EmptyStateCard>
          )}
        </VStack>
      </PageContent>
      <PageFooter>
        <Button
          disabled={!!validationMessage}
          loading={isPending}
          type="submit"
        >
          {t('save')}
        </Button>
      </PageFooter>
    </Container>
  )
}

const Container = styled(VStack)`
  gap: 0;
`

const StyledList = styled(List)`
  background-image: none;
  border: none;
  gap: 12px;
  padding: 0;
`

const StyledTextInput = styled(TextInput)`
  input {
    background: ${({ theme }) =>
      theme.colors.foreground.withAlpha(0.45).toCssValue()};
  }
`

const InputOverlay = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
`

const SwitchWrapper = styled.div`
  display: flex;
`

const EmptyStateCard = styled(VStack)`
  border-radius: 20px;
  padding: 24px;
  background: ${({ theme }) =>
    theme.colors.foreground.withAlpha(0.35).toCssValue()};
  text-align: center;
  color: ${getColor('textShy')};
`

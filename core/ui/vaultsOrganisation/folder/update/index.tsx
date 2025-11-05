import { getVaultId } from '@core/mpc/vault/Vault'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import {
  useUpdateVaultFolderMutation,
  useVaultFolders,
} from '@core/ui/storage/vaultFolders'
import { useFolderlessVaults, useFolderVaults } from '@core/ui/storage/vaults'
import { DoneButton } from '@core/ui/vault/chain/manage/shared/DoneButton'
import { useUpdateVaultMutation } from '@core/ui/vault/mutations/useUpdateVaultMutation'
import { VaultSigners } from '@core/ui/vault/signers'
import {
  LeadingIconBadge,
  VaultListRow,
} from '@core/ui/vaultsOrganisation/components'
import { DeleteVaultFolder } from '@core/ui/vaultsOrganisation/folder/delete'
import { useAddVaultToFolderMutation } from '@core/ui/vaultsOrganisation/folder/mutations/useAddVaultToFolderMutation'
import { useRemoveVaultFromFolderMutation } from '@core/ui/vaultsOrganisation/folder/mutations/useRemoveVaultFromFolderMutation'
import { useCurrentVaultFolder } from '@core/ui/vaultsOrganisation/folder/state/currentVaultFolder'
import { useVaultsTotalBalances } from '@core/ui/vaultsOrganisation/hooks/useVaultsTotalBalances'
import { getVaultSecurityTone } from '@core/ui/vaultsOrganisation/utils/getVaultSecurityTone'
import { Button } from '@lib/ui/buttons/Button'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { DnDList } from '@lib/ui/dnd/DnDList'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { CloseIcon } from '@lib/ui/icons/CloseIcon'
import { FolderLockIcon } from '@lib/ui/icons/FolderLockIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { MenuIcon } from '@lib/ui/icons/MenuIcon'
import { Switch } from '@lib/ui/inputs/switch'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import {
  DnDItemContainer,
  DnDItemHighlight,
} from '@lib/ui/list/item/DnDItemContainer'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { sortEntitiesWithOrder } from '@lib/utils/entities/EntityWithOrder'
import { getNewOrder } from '@lib/utils/order/getNewOrder'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCore } from '../../../state/core'

type VaultTotals = ReturnType<typeof useVaultsTotalBalances>['totals']

const SwitchWrapper = styled.div`
  display: flex;
`

const DragHandle = styled.div`
  display: flex;
  align-items: center;
  color: ${getColor('textShy')};
  cursor: grab;
  padding: 4px 0;
`

const LeadingGroup = styled(HStack)`
  gap: 12px;
  align-items: center;
`

const HeaderActions = styled(HStack)`
  gap: 12px;
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

const EmptyStateCard = styled(VStack)`
  border-radius: 20px;
  padding: 24px;
  background: ${({ theme }) =>
    theme.colors.foreground.withAlpha(0.35).toCssValue()};
  text-align: center;
  color: ${getColor('textShy')};
`

type AddVaultsProps = {
  totals: VaultTotals
  isTotalsPending: boolean
}

const AddVaultsToFolder = ({ totals, isTotalsPending }: AddVaultsProps) => {
  const { t } = useTranslation()
  const { id } = useCurrentVaultFolder()
  const { mutate } = useAddVaultToFolderMutation()
  const vaults = useFolderlessVaults()
  const formatFiatAmount = useFormatFiatAmount()

  if (!vaults.length) {
    return (
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
    )
  }

  return (
    <VStack gap={12}>
      <Text
        size={13}
        weight={600}
        color="shy"
        style={{ textTransform: 'uppercase' }}
      >
        {t('available')}
      </Text>
      <VStack gap={12}>
        {vaults.map(vault => {
          const vaultId = getVaultId(vault)
          const { tone, icon } = getVaultSecurityTone(vault)
          const value = totals?.[vaultId]

          const handleToggle = () => mutate({ vaultId, folderId: id })

          return (
            <VaultListRow
              key={vaultId}
              leading={<LeadingIconBadge tone={tone}>{icon}</LeadingIconBadge>}
              title={vault.name}
              subtitle={
                !isTotalsPending && value !== undefined
                  ? formatFiatAmount(value)
                  : undefined
              }
              meta={<VaultSigners vault={vault} />}
              trailing={
                <SwitchWrapper onClick={event => event.stopPropagation()}>
                  <Switch checked={false} onChange={handleToggle} />
                </SwitchWrapper>
              }
              dimmed
              onClick={handleToggle}
            />
          )
        })}
      </VStack>
    </VStack>
  )
}

type ManageFolderVaultsProps = {
  totals: VaultTotals
  isTotalsPending: boolean
}

const ManageFolderVaults = ({
  totals,
  isTotalsPending,
}: ManageFolderVaultsProps) => {
  const { t } = useTranslation()
  const { id } = useCurrentVaultFolder()
  const vaults = useFolderVaults(id)
  const [items, setItems] = useState(vaults)
  const { mutate: remove } = useRemoveVaultFromFolderMutation()
  const { mutate: updateVault } = useUpdateVaultMutation()
  const formatFiatAmount = useFormatFiatAmount()

  useEffect(() => setItems(vaults), [vaults])

  if (!items.length) {
    return null
  }

  return (
    <DnDList
      items={items}
      getItemId={getVaultId}
      onChange={(vaultId, { index }) => {
        const order = getNewOrder({
          orders: items.map(item => item.order),
          sourceIndex: items.findIndex(item => getVaultId(item) === vaultId),
          destinationIndex: index,
        })

        updateVault({ vaultId, fields: { order } })

        setItems(prevItems =>
          sortEntitiesWithOrder(
            prevItems.map(item =>
              getVaultId(item) === vaultId ? { ...item, order } : item
            )
          )
        )
      }}
      renderList={({ props: { children } }) => (
        <VStack gap={12}>
          <Text
            size={13}
            weight={600}
            color="shy"
            style={{ textTransform: 'uppercase' }}
          >
            {t('current_vaults')}
          </Text>
          <VStack gap={12}>{children}</VStack>
        </VStack>
      )}
      renderItem={({ item, draggableProps, dragHandleProps, status }) => {
        const vaultId = getVaultId(item)
        const { tone, icon } = getVaultSecurityTone(item)
        const value = totals?.[vaultId]

        const handleRemove = () => remove({ vaultId })

        return (
          <DnDItemContainer key={vaultId} {...draggableProps} status={status}>
            <VaultListRow
              leading={
                <LeadingGroup>
                  <DragHandle {...dragHandleProps}>
                    <MenuIcon fontSize={20} />
                  </DragHandle>
                  <LeadingIconBadge tone={tone}>{icon}</LeadingIconBadge>
                </LeadingGroup>
              }
              title={item.name}
              subtitle={
                !isTotalsPending && value !== undefined
                  ? formatFiatAmount(value)
                  : undefined
              }
              meta={<VaultSigners vault={item} />}
              trailing={
                <SwitchWrapper onClick={event => event.stopPropagation()}>
                  <Switch checked onChange={handleRemove} />
                </SwitchWrapper>
              }
            />
            {status === 'overlay' && <DnDItemHighlight />}
          </DnDItemContainer>
        )
      }}
    />
  )
}

export const UpdateVaultFolderPage = () => {
  const { t } = useTranslation()
  const { mutate, isPending } = useUpdateVaultFolderMutation()
  const { id, name: currentName } = useCurrentVaultFolder()
  const [name, setName] = useState<string>(currentName)
  const { goBack } = useCore()
  const folders = useVaultFolders()
  const { totals, isPending: isTotalsPending } = useVaultsTotalBalances()

  const names = useMemo(
    () => folders.filter(folder => folder.id !== id).map(({ name }) => name),
    [folders, id]
  )

  const validationMessage = useMemo(() => {
    if (!name) return t('folder_name_required')

    if (names.includes(name)) return t('folder_name_already_exists')

    return null
  }, [name, names, t])

  return (
    <VStack
      as="form"
      {...getFormProps({
        isDisabled: validationMessage ?? undefined,
        isPending,
        onSubmit: () => mutate({ id, fields: { name } }, { onSuccess: goBack }),
      })}
      fullHeight
    >
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={goBack} />}
        secondaryControls={
          <HeaderActions>
            <DeleteVaultFolder />
            <DoneButton onClick={goBack} />
          </HeaderActions>
        }
        title={currentName}
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
        <ManageFolderVaults totals={totals} isTotalsPending={isTotalsPending} />
        <AddVaultsToFolder totals={totals} isTotalsPending={isTotalsPending} />
      </PageContent>
      <PageFooter>
        <Button
          disabled={!!validationMessage}
          loading={isPending}
          type="submit"
        >
          {t('save_changes')}
        </Button>
      </PageFooter>
    </VStack>
  )
}

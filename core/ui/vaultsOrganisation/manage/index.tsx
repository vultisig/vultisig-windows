import { getVaultId, Vault } from '@core/mpc/vault/Vault'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import {
  useUpdateVaultFolderMutation,
  useVaultFolders,
} from '@core/ui/storage/vaultFolders'
import { useFolderlessVaults, useVaults } from '@core/ui/storage/vaults'
import { DoneButton } from '@core/ui/vault/chain/manage/shared/DoneButton'
import { useUpdateVaultMutation } from '@core/ui/vault/mutations/useUpdateVaultMutation'
import { VaultSigners } from '@core/ui/vault/signers'
import {
  LeadingIconBadge,
  VaultListRow,
} from '@core/ui/vaultsOrganisation/components'
import { useVaultsTotalBalances } from '@core/ui/vaultsOrganisation/hooks/useVaultsTotalBalances'
import { getVaultSecurityTone } from '@core/ui/vaultsOrganisation/utils/getVaultSecurityTone'
import { Button } from '@lib/ui/buttons/Button'
import { DnDList } from '@lib/ui/dnd/DnDList'
import { FolderLockIcon } from '@lib/ui/icons/FolderLockIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { MenuIcon } from '@lib/ui/icons/MenuIcon'
import { PlusIcon } from '@lib/ui/icons/PlusIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import {
  DnDItemContainer,
  DnDItemHighlight,
} from '@lib/ui/list/item/DnDItemContainer'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { sortEntitiesWithOrder } from '@lib/utils/entities/EntityWithOrder'
import { getNewOrder } from '@lib/utils/order/getNewOrder'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

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

const AddFolderButton = styled(Button)`
  border-radius: 40px;
  border: 1px solid ${getColor('foregroundExtra')};
  background: ${({ theme }) =>
    theme.colors.background.withAlpha(0.05).toCssValue()};

  &:hover {
    background: ${({ theme }) =>
      theme.colors.background.withAlpha(0.1).toCssValue()};
  }
`

const ManageFolders = () => {
  const { t } = useTranslation()
  const { mutate } = useUpdateVaultFolderMutation()
  const folders = useVaultFolders()
  const allVaults = useVaults()
  const [items, setItems] = useState(folders)

  useEffect(() => setItems(folders), [folders])

  const vaultCountByFolder = useMemo(() => {
    const map = new Map<string, number>()
    allVaults.forEach(vault => {
      if (!vault.folderId) return
      map.set(vault.folderId, (map.get(vault.folderId) ?? 0) + 1)
    })
    return map
  }, [allVaults])

  if (!items.length) {
    return null
  }

  return (
    <DnDList
      items={items}
      getItemId={item => item.id}
      onChange={(id, { index }) => {
        const order = getNewOrder({
          orders: items.map(item => item.order),
          sourceIndex: items.findIndex(item => item.id === id),
          destinationIndex: index,
        })

        mutate({ id, fields: { order } })

        setItems(prevItems =>
          sortEntitiesWithOrder(
            prevItems.map(item => (item.id === id ? { ...item, order } : item))
          )
        )
      }}
      renderList={({ props: { children } }) => (
        <VStack gap={16}>
          <Text
            size={13}
            weight={600}
            color="shy"
            style={{ textTransform: 'uppercase' }}
          >
            {t('folders')}
          </Text>
          <VStack gap={12}>{children}</VStack>
        </VStack>
      )}
      renderItem={({ item, draggableProps, dragHandleProps, status }) => (
        <DnDItemContainer key={item.id} {...draggableProps} status={status}>
          <VaultListRow
            leading={
              <LeadingGroup>
                <DragHandle {...dragHandleProps}>
                  <MenuIcon fontSize={20} />
                </DragHandle>
                <LeadingIconBadge tone="neutral">
                  <FolderLockIcon style={{ fontSize: 20 }} />
                </LeadingIconBadge>
              </LeadingGroup>
            }
            title={item.name}
            subtitle={t('vault_count', {
              count: vaultCountByFolder.get(item.id) ?? 0,
            })}
            disabled
          />
          {status === 'overlay' && <DnDItemHighlight />}
        </DnDItemContainer>
      )}
    />
  )
}

const ManageVaultsList = () => {
  const { t } = useTranslation()
  const { mutate } = useUpdateVaultMutation()
  const vaults = useFolderlessVaults()
  const [items, setItems] = useState<Vault[]>(vaults)
  const { totals: vaultTotals, isPending: isTotalsPending } =
    useVaultsTotalBalances()
  const formatFiatAmount = useFormatFiatAmount()

  useEffect(() => setItems(vaults), [vaults])

  if (!items.length) {
    return null
  }

  return (
    <DnDList
      items={items}
      getItemId={getVaultId}
      onChange={(id, { index }) => {
        const order = getNewOrder({
          orders: items.map(item => item.order),
          sourceIndex: items.findIndex(item => getVaultId(item) === id),
          destinationIndex: index,
        })

        mutate({ vaultId: id, fields: { order } })

        setItems(prevItems =>
          sortEntitiesWithOrder(
            prevItems.map(item =>
              getVaultId(item) === id ? { ...item, order } : item
            )
          )
        )
      }}
      renderList={({ props: { children } }) => (
        <VStack gap={16}>
          <Text
            size={13}
            weight={600}
            color="shy"
            style={{ textTransform: 'uppercase' }}
          >
            {t('vaults')}
          </Text>
          <VStack gap={12}>{children}</VStack>
        </VStack>
      )}
      renderItem={({ item, draggableProps, dragHandleProps, status }) => {
        const vaultId = getVaultId(item)
        const { tone, icon } = getVaultSecurityTone(item)
        const value = vaultTotals?.[vaultId]

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
              disabled
            />
            {status === 'overlay' && <DnDItemHighlight />}
          </DnDItemContainer>
        )
      }}
    />
  )
}

export const ManageVaultsPage = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const goBack = useNavigateBack()

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={goBack} />}
        secondaryControls={<DoneButton onClick={goBack} />}
        title={t('edit_vaults')}
      />
      <PageContent gap={32} flexGrow scrollable>
        <ManageFolders />
        <ManageVaultsList />
        <AddFolderButton
          kind="secondary"
          onClick={() => navigate({ id: 'createVaultFolder' })}
          icon={
            <IconWrapper size={18}>
              <PlusIcon />
            </IconWrapper>
          }
        >
          {t('create_folder')}
        </AddFolderButton>
      </PageContent>
    </VStack>
  )
}

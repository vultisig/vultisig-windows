import { getVaultId, Vault } from '@core/mpc/vault/Vault'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { useFolderlessVaults } from '@core/ui/storage/vaults'
import { useUpdateVaultMutation } from '@core/ui/vault/mutations/useUpdateVaultMutation'
import { VaultSigners } from '@core/ui/vault/signers'
import {
  LeadingIconBadge,
  VaultListRow,
} from '@core/ui/vaultsOrganisation/components'
import { useVaultsTotalBalances } from '@core/ui/vaultsOrganisation/hooks/useVaultsTotalBalances'
import { getVaultSecurityTone } from '@core/ui/vaultsOrganisation/utils/getVaultSecurityTone'
import { DnDList } from '@lib/ui/dnd/DnDList'
import { MenuIcon } from '@lib/ui/icons/MenuIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import {
  DnDItemContainer,
  DnDItemHighlight,
} from '@lib/ui/list/item/DnDItemContainer'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { sortEntitiesWithOrder } from '@lib/utils/entities/EntityWithOrder'
import { getNewOrder } from '@lib/utils/order/getNewOrder'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const VaultsSection = () => {
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
            />
            {status === 'overlay' && <DnDItemHighlight />}
          </DnDItemContainer>
        )
      }}
    />
  )
}

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

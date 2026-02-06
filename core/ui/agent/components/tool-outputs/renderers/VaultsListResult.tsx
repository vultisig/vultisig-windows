import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC } from 'react'
import styled from 'styled-components'

import { ResultPanel } from '../ResultPanel'
import { ResultRow } from '../ResultRow'

type VaultItem = {
  name: string
  signers?: number
  threshold?: number
  createdAt?: string
  created_at?: string
  isActive?: boolean
  is_active?: boolean
}

type VaultsListData = {
  vaults?: VaultItem[]
  activeVault?: string
}

type Props = {
  data: unknown
}

const isVaultsListData = (data: unknown): data is VaultsListData => {
  if (typeof data !== 'object' || data === null) return false
  const obj = data as Record<string, unknown>
  if (!Array.isArray(obj.vaults)) return false
  return obj.vaults.every(
    (item: unknown) =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as VaultItem).name === 'string'
  )
}

const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export const VaultsListResult: FC<Props> = ({ data }) => {
  if (!isVaultsListData(data) || !data.vaults) {
    return null
  }

  return (
    <ResultPanel title="Your Vaults" count={data.vaults.length}>
      {data.vaults.map((vault, index) => {
        const isActive =
          vault.isActive || vault.is_active || vault.name === data.activeVault
        const createdAt = vault.createdAt || vault.created_at

        return (
          <ResultRow
            key={index}
            icon={<VaultIcon>🔐</VaultIcon>}
            extra={
              isActive && (
                <ActiveBadge>
                  <Text size={11} color="success">
                    ✓ Active
                  </Text>
                </ActiveBadge>
              )
            }
          >
            <VStack gap={2}>
              <Text size={14} weight={500} color="regular">
                {vault.name}
              </Text>
              <HStack gap={8}>
                {vault.signers !== undefined && (
                  <Text size={12} color="shy">
                    {vault.threshold || vault.signers} signers
                  </Text>
                )}
                {createdAt && (
                  <Text size={12} color="shy">
                    {formatDate(createdAt)}
                  </Text>
                )}
              </HStack>
            </VStack>
          </ResultRow>
        )
      })}
    </ResultPanel>
  )
}

const VaultIcon = styled.span`
  font-size: 20px;
`

const ActiveBadge = styled.div`
  padding: 2px 8px;
  border-radius: 4px;
  background: ${getColor('primary')};
  background: rgba(51, 230, 191, 0.15);
`

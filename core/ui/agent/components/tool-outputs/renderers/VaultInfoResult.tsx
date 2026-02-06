import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { MiddleTruncate } from '@lib/ui/truncate'
import { FC, useState } from 'react'
import styled from 'styled-components'

import { CopyButton } from '../CopyButton'

type VaultInfoData = {
  name?: string
  createdAt?: string
  signers?: number
  threshold?: number
  coinCount?: number
  publicKeyEcdsa?: string
  publicKeyEddsa?: string
}

type Props = {
  data: unknown
}

const isVaultInfoData = (data: unknown): data is VaultInfoData => {
  if (typeof data !== 'object' || data === null) return false
  return true
}

const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export const VaultInfoResult: FC<Props> = ({ data }) => {
  const [showKeys, setShowKeys] = useState(false)

  if (!isVaultInfoData(data)) {
    return null
  }

  const hasPublicKeys = data.publicKeyEcdsa || data.publicKeyEddsa

  return (
    <Container>
      <VStack gap={16}>
        <HStack gap={8} alignItems="center">
          <VaultIcon>🔐</VaultIcon>
          <Text size={16} weight={600} color="regular">
            {data.name || 'Vault'}
          </Text>
        </HStack>

        <VStack gap={8}>
          {data.createdAt && (
            <InfoRow>
              <Text size={13} color="shy">
                Created
              </Text>
              <Text size={13} color="supporting">
                {formatDate(data.createdAt)}
              </Text>
            </InfoRow>
          )}
          {data.signers !== undefined && data.threshold !== undefined && (
            <InfoRow>
              <Text size={13} color="shy">
                Signers
              </Text>
              <Text size={13} color="supporting">
                {data.threshold} of {data.signers}
              </Text>
            </InfoRow>
          )}
          {data.coinCount !== undefined && (
            <InfoRow>
              <Text size={13} color="shy">
                Coins tracked
              </Text>
              <Text size={13} color="supporting">
                {data.coinCount}
              </Text>
            </InfoRow>
          )}
        </VStack>

        {hasPublicKeys && (
          <VStack gap={8}>
            <Divider />
            <ExpandButton onClick={() => setShowKeys(!showKeys)}>
              <Text size={13} weight={500} color="supporting">
                Public Keys
              </Text>
              <ExpandIcon $expanded={showKeys}>▸</ExpandIcon>
            </ExpandButton>

            {showKeys && (
              <VStack gap={8}>
                {data.publicKeyEcdsa && (
                  <KeyRow>
                    <Text size={12} color="shy" nowrap>
                      ECDSA
                    </Text>
                    <HStack gap={4} alignItems="center" flexGrow>
                      <MiddleTruncate
                        text={data.publicKeyEcdsa}
                        color="textSupporting"
                        size={12}
                        flexGrow
                      />
                      <CopyButton
                        value={data.publicKeyEcdsa}
                        label="ECDSA key copied"
                      />
                    </HStack>
                  </KeyRow>
                )}
                {data.publicKeyEddsa && (
                  <KeyRow>
                    <Text size={12} color="shy" nowrap>
                      EdDSA
                    </Text>
                    <HStack gap={4} alignItems="center" flexGrow>
                      <MiddleTruncate
                        text={data.publicKeyEddsa}
                        color="textSupporting"
                        size={12}
                        flexGrow
                      />
                      <CopyButton
                        value={data.publicKeyEddsa}
                        label="EdDSA key copied"
                      />
                    </HStack>
                  </KeyRow>
                )}
              </VStack>
            )}
          </VStack>
        )}
      </VStack>
    </Container>
  )
}

const Container = styled.div`
  padding: 16px;
  background: ${getColor('foreground')};
  border-radius: 8px;
  border: 1px solid ${getColor('mist')};
`

const VaultIcon = styled.span`
  font-size: 20px;
`

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Divider = styled.div`
  height: 1px;
  background: ${getColor('mist')};
`

const ExpandButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: none;
  border: none;
  padding: 4px 0;
  cursor: pointer;
`

const ExpandIcon = styled.span<{ $expanded: boolean }>`
  font-size: 10px;
  color: ${getColor('textSupporting')};
  transform: rotate(${({ $expanded }) => ($expanded ? '90deg' : '0deg')});
  transition: transform 0.2s ease;
`

const KeyRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: ${getColor('background')};
  border-radius: 6px;
`

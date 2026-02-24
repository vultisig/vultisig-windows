import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import type { TokenResultInfo } from '../types'

type DeploymentState = 'idle' | 'loading' | 'added' | 'error'

type Props = {
  tokens: TokenResultInfo[]
  onAddToken: (
    chain: string,
    symbol: string,
    contractAddress: string,
    decimals: number,
    logo?: string
  ) => Promise<{ success: boolean; error?: string }>
}

export const TokenResultsCard: FC<Props> = ({ tokens, onAddToken }) => {
  const { t } = useTranslation()
  const [deploymentStates, setDeploymentStates] = useState<
    Record<string, DeploymentState>
  >({})

  const getKey = (symbol: string, chain: string, contract: string) =>
    `${symbol}:${chain}:${contract}`

  const handleAdd = async (
    token: TokenResultInfo,
    deployment: TokenResultInfo['deployments'][number]
  ) => {
    const key = getKey(
      token.symbol,
      deployment.chain,
      deployment.contract_address
    )
    setDeploymentStates(prev => ({ ...prev, [key]: 'loading' }))

    const result = await onAddToken(
      deployment.chain,
      token.symbol,
      deployment.contract_address,
      deployment.decimals ?? 18,
      token.logo ?? token.logo_url
    )

    setDeploymentStates(prev => ({
      ...prev,
      [key]: result.success ? 'added' : 'error',
    }))
  }

  return (
    <Container>
      <Text size={12} color="supporting" weight={600}>
        {t('token_results')}
      </Text>
      <VStack gap={8}>
        {tokens.map(token => (
          <TokenCard key={`${token.symbol}-${token.name}`}>
            <HStack gap={10} alignItems="center">
              {(token.logo || token.logo_url) && (
                <TokenLogo
                  src={(token.logo || token.logo_url)!}
                  alt={token.symbol}
                />
              )}
              <VStack gap={2}>
                <HStack gap={6} alignItems="center">
                  <Text size={14} weight={600}>
                    {token.symbol.toUpperCase()}
                  </Text>
                  <Text size={12} color="supporting">
                    {token.name}
                  </Text>
                </HStack>
                {token.price_usd && (
                  <Text size={12} color="supporting">
                    ${token.price_usd}
                  </Text>
                )}
              </VStack>
            </HStack>
            {token.deployments.length === 0 ? (
              <Text size={12} color="supporting">
                {t('no_deployments')}
              </Text>
            ) : (
              <DeploymentsList>
                {token.deployments.map(dep => {
                  const key = getKey(
                    token.symbol,
                    dep.chain,
                    dep.contract_address
                  )
                  const state = deploymentStates[key] ?? 'idle'

                  return (
                    <DeploymentRow key={key}>
                      <Text size={13}>{dep.chain}</Text>
                      <AddButton
                        onClick={() => handleAdd(token, dep)}
                        disabled={state === 'loading' || state === 'added'}
                        $state={state}
                      >
                        <Text size={12} weight={600}>
                          {state === 'idle' && t('add_to_vault')}
                          {state === 'loading' && t('adding_to_vault')}
                          {state === 'added' && t('added_to_vault')}
                          {state === 'error' && t('failed_to_add_token')}
                        </Text>
                      </AddButton>
                    </DeploymentRow>
                  )
                })}
              </DeploymentsList>
            )}
          </TokenCard>
        ))}
      </VStack>
    </Container>
  )
}

const Container = styled(VStack)`
  gap: 8px;
  margin-left: 44px;
  margin-top: 4px;
`

const TokenCard = styled(VStack)`
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  background: ${getColor('foreground')};
`

const TokenLogo = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
`

const DeploymentsList = styled(VStack)`
  gap: 4px;
`

const DeploymentRow = styled(HStack)`
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
`

const AddButton = styled.button<{ $state: DeploymentState }>`
  border: none;
  border-radius: 6px;
  padding: 4px 12px;
  cursor: ${({ $state }) =>
    $state === 'loading' || $state === 'added' ? 'default' : 'pointer'};
  opacity: ${({ $state }) => ($state === 'loading' ? 0.6 : 1)};
  background: ${({ $state }) => {
    if ($state === 'added') return '#33e6bf30'
    if ($state === 'error') return '#ff4d4f30'
    return '#33e6bf20'
  }};
  color: ${({ $state }) => {
    if ($state === 'added') return '#33e6bf'
    if ($state === 'error') return '#ff4d4f'
    return '#33e6bf'
  }};

  &:hover:not(:disabled) {
    background: #33e6bf30;
  }
`

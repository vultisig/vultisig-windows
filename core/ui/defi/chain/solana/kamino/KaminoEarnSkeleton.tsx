import { borderRadius } from '@lib/ui/css/borderRadius'
import { VStack } from '@lib/ui/layout/Stack'
import { kaminoVaultRegistry } from '@vultisig/core-chain/chains/solana/kamino/registry'
import styled, { keyframes } from 'styled-components'

/**
 * Placeholder cards shown while the vaults hydrate — one per curated vault, so
 * the list does not reflow when the real cards arrive.
 */
export const KaminoEarnSkeleton = () => (
  <VStack gap={12}>
    {kaminoVaultRegistry.map(({ address }) => (
      <SkeletonCard key={address} />
    ))}
  </VStack>
)

const pulse = keyframes`
  0% { opacity: 0.4; }
  50% { opacity: 0.7; }
  100% { opacity: 0.4; }
`

const SkeletonCard = styled.div`
  height: 156px;
  ${borderRadius.xl};
  background: rgba(255, 255, 255, 0.04);
  animation: ${pulse} 1.6s ease-in-out infinite;
`

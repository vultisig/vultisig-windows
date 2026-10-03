import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { AnimatedFiatAmount } from '@core/ui/chain/components/AnimatedFiatAmount'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { useAssertCurrentVaultId } from '@core/ui/storage/currentVaultId'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { useCurrentVaultChain } from '@core/ui/vault/chain/useCurrentVaultChain'
import { VaultPrimaryActions } from '@core/ui/vault/components/VaultPrimaryActions'
import { useVaultChainTotalBalanceQuery } from '@core/ui/vault/queries/useVaultChainTotalBalanceQuery'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { Opener } from '@lib/ui/base/Opener'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { SquareBehindSquare6Icon } from '@lib/ui/icons/SquareBehindSquare6Icon'
import { HStack, hStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useToast } from '@lib/ui/toast/ToastProvider'
import { attempt } from '@vultisig/lib-utils/attempt'
import { formatWalletAddress } from '@vultisig/lib-utils/formatWalletAddress'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { AddressQRModal } from './address/AddressQRModal'

const AddressPill = styled(UnstyledButton)`
  ${hStack({ alignItems: 'center', gap: 4 })};
  padding: 4px 6px;
  ${borderRadius.sm};
  background: rgba(81, 128, 252, 0.12);
  cursor: pointer;
  transition: opacity 0.2s ease;

  & * {
    color: ${getColor('info')};
  }

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 0.6;
  }
`

const CopyIcon = styled(IconWrapper)`
  padding: 4px;
`

/**
 * Header of the chain page: chain name, total balance, the vault's address
 * for the chain (the whole pill copies it) and the primary actions.
 */
export const VaultChainOverview = () => {
  const chain = useCurrentVaultChain()
  const address = useCurrentVaultAddress(chain)
  const currentVaultId = useAssertCurrentVaultId()
  const totalBalanceQuery = useVaultChainTotalBalanceQuery(chain)
  const { t } = useTranslation()
  const { addToast } = useToast()

  const handleCopyAddress = async () => {
    const result = await attempt(() => navigator.clipboard.writeText(address))

    if ('error' in result) {
      addToast({ message: t('failed_to_copy_address'), status: 'error' })

      return
    }

    addToast({ message: t('chain_address_copied', { chain }) })
  }

  return (
    <VStack alignItems="center" gap={32}>
      <VStack alignItems="center" gap={12}>
        <HStack alignItems="center" gap={8}>
          <ChainEntityIcon
            value={getChainLogoSrc(chain)}
            style={{ fontSize: 24 }}
          />
          <Text weight="500" color="contrast" size={16}>
            {chain}
          </Text>
        </HStack>
        <VStack alignItems="center" gap={8}>
          <MatchQuery
            value={totalBalanceQuery}
            error={() => t('failed_to_load')}
            pending={() => <Spinner />}
            success={value => (
              <HStack gap={8} alignItems="center">
                <Text size={32} weight="700" color="contrast" centerVertically>
                  <BalanceVisibilityAware>
                    <AnimatedFiatAmount
                      value={value}
                      cacheKey={`chain-total-${currentVaultId}-${chain}`}
                    />
                  </BalanceVisibilityAware>
                </Text>
                {totalBalanceQuery.isUpdating ? (
                  <Spinner size="0.9em" style={{ opacity: 0.5 }} />
                ) : null}
              </HStack>
            )}
          />
          <AddressPill
            onClick={handleCopyAddress}
            aria-label={t('copy_address')}
          >
            <Text as="span" weight={500} color="info" size={12}>
              {formatWalletAddress(address)}
            </Text>
            <CopyIcon size={12}>
              <SquareBehindSquare6Icon />
            </CopyIcon>
          </AddressPill>
        </VStack>
      </VStack>
      <Opener
        renderOpener={({ onOpen }) => (
          <VaultPrimaryActions coin={{ chain }} onReceive={onOpen} />
        )}
        renderContent={({ onClose }) => (
          <AddressQRModal chain={chain} onClose={onClose} />
        )}
      />
    </VStack>
  )
}

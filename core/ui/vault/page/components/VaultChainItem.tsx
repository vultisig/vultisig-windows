import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { getCoinValue } from '@core/chain/coin/utils/getCoinValue'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { useHandleVaultChainItemPress } from '@core/ui/vault/page/components/useHandleVaultChainItemPress'
import { VaultAddressCopyToast } from '@core/ui/vault/page/components/VaultAddressCopyToast'
import { VaultChainBalance } from '@core/ui/vault/queries/useVaultChainsBalancesQuery'
import { useCurrentVaultAddresses } from '@core/ui/vault/state/currentVaultCoins'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { SquareBehindSquare6Icon } from '@lib/ui/icons/SquareBehindSquare6Icon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useToast } from '@lib/ui/toast/ToastProvider'
import { sum } from '@lib/utils/array/sum'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { formatAmount } from '@lib/utils/formatAmount'
import { formatWalletAddress } from '@lib/utils/formatWalletAddress'
import { KeyboardEvent, MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type VaultChainItemProps = {
  balance: VaultChainBalance
}

export const VaultChainItem = ({ balance }: VaultChainItemProps) => {
  const { chain, coins } = balance

  const addresses = useCurrentVaultAddresses()
  const address = shouldBePresent(
    addresses[chain],
    `Vault address missing for chain ${chain}`
  )

  const pressHandlers = useHandleVaultChainItemPress({
    chain,
  })

  const { t } = useTranslation()
  const { addToast } = useToast()

  const handleCopyAddress = (e: KeyboardEvent | MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    navigator.clipboard
      .writeText(address)
      .then(() => {
        addToast({
          message: '',
          renderContent: () => <VaultAddressCopyToast value={chain} />,
        })
      })
      .catch(() => {
        addToast({
          message: t('failed_to_copy_address'),
        })
      })
  }

  const formatFiatAmount = useFormatFiatAmount()

  const singleCoin = coins.length === 1 ? coins[0] : null

  const totalAmount = sum(
    coins.map(coin =>
      getCoinValue({
        price: coin.price ?? 0,
        amount: coin.amount,
        decimals: coin.decimals,
      })
    )
  )

  return (
    <StyledPanel data-testid="VaultChainItem-Panel" {...pressHandlers}>
      <HStack fullWidth alignItems="center" gap={12}>
        <ChainEntityIcon
          value={getChainLogoSrc(chain)}
          style={{ fontSize: 32 }}
        />

        <VStack fullWidth alignItems="start" gap={12}>
          <HStack
            fullWidth
            alignItems="center"
            justifyContent="space-between"
            gap={20}
          >
            <VStack>
              <Text color="contrast" size={14}>
                {chain}
              </Text>
              <AddressRow
                alignItems="center"
                gap={4}
                onClick={handleCopyAddress}
                onKeyDown={(e: KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleCopyAddress(e)
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Copy ${chain} address`}
              >
                <Text weight={500} color="shy" size={12}>
                  {formatWalletAddress(address)}
                </Text>
                <SquareBehindSquare6Icon />
              </AddressRow>
            </VStack>
            <HStack gap={8} alignItems="center">
              <VStack
                gap={8}
                justifyContent="space-between"
                alignItems="flex-end"
              >
                <Text centerVertically color="contrast" weight="550" size={14}>
                  <BalanceVisibilityAware>
                    {formatFiatAmount(totalAmount)}
                  </BalanceVisibilityAware>
                </Text>
                <Text color="shy" weight="500" size={12} centerVertically>
                  {singleCoin ? (
                    <BalanceVisibilityAware>
                      {formatAmount(
                        fromChainAmount(singleCoin.amount, singleCoin.decimals),
                        { precision: 'high', ticker: singleCoin.ticker }
                      )}
                    </BalanceVisibilityAware>
                  ) : coins.length > 1 ? (
                    <BalanceVisibilityAware>
                      <>
                        {coins.length} {t('assets')}
                      </>
                    </BalanceVisibilityAware>
                  ) : null}
                </Text>
              </VStack>
              <IconWrapper>
                <ChevronRightIcon />
              </IconWrapper>
            </HStack>
          </HStack>
        </VStack>
      </HStack>
    </StyledPanel>
  )
}

const StyledPanel = styled(Panel)`
  cursor: pointer;

  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${getColor('foregroundExtra')};
  }
`

const AddressRow = styled(HStack)`
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 0.6;
  }
`

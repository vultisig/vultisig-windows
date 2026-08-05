import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { useCore } from '@core/ui/state/core'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { AddressQRModal } from '@core/ui/vault/chain/address/AddressQRModal'
import { CoinMarketStatsSection } from '@core/ui/vault/chain/coin/market/CoinMarketStatsSection'
import { CoinPriceChart } from '@core/ui/vault/chain/coin/market/CoinPriceChart'
import { CoinPriceExtremesSection } from '@core/ui/vault/chain/coin/market/CoinPriceExtremesSection'
import { CoinTokenInfoSection } from '@core/ui/vault/chain/coin/market/CoinTokenInfoSection'
import { CoinTicker } from '@core/ui/vault/chain/CoinTicker'
import { VaultPrimaryActions } from '@core/ui/vault/components/VaultPrimaryActions'
import { VaultChainCoin } from '@core/ui/vault/queries/useVaultChainCoinsQuery'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { Opener } from '@lib/ui/base/Opener'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { ArCubeIcon } from '@lib/ui/icons/ArCubeIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { ModalCloseButton } from '@lib/ui/modal/ModalCloseButton'
import { ResponsiveModal } from '@lib/ui/modal/ResponsiveModal'
import { OnCloseProp } from '@lib/ui/props'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { getBlockExplorerUrl } from '@vultisig/core-chain/utils/getBlockExplorerUrl'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import styled from 'styled-components'

type CoinDetailModalProps = OnCloseProp & {
  coin: VaultChainCoin
}

export const CoinDetailModal = ({ coin, onClose }: CoinDetailModalProps) => {
  const { openUrl } = useCore()
  const formatFiatAmount = useFormatFiatAmount()
  const balance = fromChainAmount(coin.amount, coin.decimals)
  const fiatValue = (coin.price || 0) * balance
  const address = useCurrentVaultAddress(coin.chain)
  const blockExplorerUrl = getBlockExplorerUrl({
    chain: coin.chain,
    entity: 'address',
    value: address,
  })

  return (
    <ResponsiveModal
      grabbable
      isOpen
      onClose={onClose}
      modalProps={{
        withDefaultStructure: false,
      }}
    >
      <ScrollContainer>
        <ContentContainer>
          <VStack alignItems="center" fullWidth style={{ zIndex: 2 }}>
            <HStack justifyContent="space-between" fullWidth gap={8}>
              <ModalCloseButton
                style={{ color: 'hsl(215, 40%, 85%)', fontSize: 16 }}
                onClick={onClose}
              />
              <IconButton onClick={() => openUrl(blockExplorerUrl)}>
                <IconWrapper size={20}>
                  <ArCubeIcon />
                </IconWrapper>
              </IconButton>
            </HStack>
            <HStack alignItems="center" gap={8}>
              <CoinIcon coin={coin} style={{ fontSize: 24 }} />
              <CoinTicker
                ticker={coin.ticker}
                size={20}
                weight={600}
                maxWidth={240}
              />
            </HStack>
          </VStack>
          <VStack alignItems="center" gap={8}>
            <Text size={28} weight={500} color="contrast">
              <BalanceVisibilityAware>
                {formatFiatAmount(fiatValue)}
              </BalanceVisibilityAware>
            </Text>
            <Text
              size={15}
              weight={500}
              color="shy"
              cropped
              style={{ maxWidth: 240 }}
            >
              <BalanceVisibilityAware>
                {formatAmount(balance, { precision: 'high' })} {coin.ticker}
              </BalanceVisibilityAware>
            </Text>
          </VStack>

          <Opener
            renderOpener={({ onOpen }) => (
              <VaultPrimaryActions coin={coin} onReceive={onOpen} />
            )}
            renderContent={({ onClose: onCloseQR }) => (
              <AddressQRModal
                chain={coin.chain}
                coin={coin}
                onClose={onCloseQR}
              />
            )}
          />

          <SectionsContainer>
            <CoinPriceChart coin={coin} />
            <CoinMarketStatsSection coin={coin} />
            <CoinPriceExtremesSection coin={coin} />
            <CoinTokenInfoSection coin={coin} />
          </SectionsContainer>
        </ContentContainer>
      </ScrollContainer>
    </ResponsiveModal>
  )
}

const ScrollContainer = styled.div`
  width: 100%;

  @media ${mediaQuery.tabletDeviceAndUp} {
    max-height: 82vh;
    overflow-y: auto;
    overflow-x: hidden;
    border-radius: 12px;
  }
`

const ContentContainer = styled(VStack)`
  position: relative;
  gap: 32px;
  padding: 0 16px 20px 16px;
  background: linear-gradient(
    0deg,
    ${getColor('foreground')} 50%,
    rgba(6, 27, 58, 0.5) 85%,
    rgba(6, 27, 58, 0) 100%
  );
  align-items: center;

  @media ${mediaQuery.tabletDeviceAndUp} {
    margin-inline: revert;
    padding: 24px;
    background: linear-gradient(
      0deg,
      ${getColor('foreground')} 50%,
      rgba(6, 27, 58, 0.5) 97%,
      rgba(6, 27, 58, 0) 100%
    );
    border-radius: 12px;
  }

  > * {
    position: relative;
    z-index: 1;
  }

  &::before {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 50%;
    content: '';
    transform: rotate(-90deg);
    background-image: url('/core/images/qr-modal-bg.png');
    background-size: cover;
    background-position: center;
    mix-blend-mode: overlay;
    z-index: 0;
  }

  &::after {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    width: 50%;
    content: '';
    transform: rotate(90deg);
    background-image: url('/core/images/qr-modal-bg.png');
    background-size: cover;
    background-position: center;
    mix-blend-mode: overlay;
    z-index: 0;
  }
`

const SectionsContainer = styled(VStack)`
  gap: 16px;
  width: 100%;
  max-width: 400px;
  margin-top: 8px;
`

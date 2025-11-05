import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { AddressQRModal } from '@core/ui/vault/chain/address/AddressQRModal'
import { VaultPrimaryActions } from '@core/ui/vault/components/VaultPrimaryActions'
import { VaultChainCoin } from '@core/ui/vault/queries/useVaultChainCoinsQuery'
import { Opener } from '@lib/ui/base/Opener'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { ResponsiveModal } from '@lib/ui/modal/ResponsiveModal'
import { OnCloseProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { formatAmount } from '@lib/utils/formatAmount'
import styled from 'styled-components'

type CoinDetailModalProps = OnCloseProp & {
  coin: VaultChainCoin
}

const ContentContainer = styled(VStack)`
  position: relative;
  gap: 32px;
  align-items: center;
  padding: 20px 0;
  margin-inline: -32px;
  margin-bottom: -20px;
  background: linear-gradient(
    0deg,
    #061b3a 50%,
    rgba(6, 27, 58, 0.5) 85%,
    rgba(6, 27, 58, 0) 100%
  );

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
    z-index: -1;
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
    z-index: -1;
  }
`

const BalanceCard = styled(VStack)`
  gap: 8px;
  align-items: center;
`

const InfoSection = styled(VStack)`
  gap: 16px;
  width: 100%;
  max-width: 400px;
  margin-top: 8px;
`

const InfoRow = styled(HStack)`
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  background: ${getColor('background')};
`

const NetworkBadge = styled.div`
  padding: 6px 12px;
  border-radius: 8px;
  background: ${getColor('foreground')};
`

export const CoinDetailModal = ({ coin, onClose }: CoinDetailModalProps) => {
  const formatFiatAmount = useFormatFiatAmount()
  const balance = fromChainAmount(coin.amount, coin.decimals)
  const fiatValue = (coin.price || 0) * balance

  return (
    <ResponsiveModal isOpen onClose={onClose}>
      <ContentContainer>
        <HStack alignItems="center" gap={8}>
          <CoinIcon coin={coin} style={{ fontSize: 24 }} />
          <Text size={20} weight={600} color="contrast">
            {coin.ticker}
          </Text>
        </HStack>

        <BalanceCard>
          <Text size={28} weight={500} color="contrast">
            <BalanceVisibilityAware>
              {formatFiatAmount(fiatValue)}
            </BalanceVisibilityAware>
          </Text>
          <Text size={15} weight={500} color="shy">
            <BalanceVisibilityAware>
              {formatAmount(balance, { precision: 'high' })} {coin.ticker}
            </BalanceVisibilityAware>
          </Text>
        </BalanceCard>

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

        <InfoSection>
          <InfoRow>
            <Text size={14} weight={500}>
              Price
            </Text>
            <NetworkBadge>
              <Text size={13} color="shyExtra">
                {formatFiatAmount(coin.price || 0)}
              </Text>
            </NetworkBadge>
          </InfoRow>

          <InfoRow>
            <Text size={14} weight={500}>
              Network
            </Text>
            <NetworkBadge>
              <Text size={13} color="shyExtra">
                {coin.chain}
              </Text>
            </NetworkBadge>
          </InfoRow>
        </InfoSection>
      </ContentContainer>
    </ResponsiveModal>
  )
}

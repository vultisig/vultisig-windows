import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { AddressQRModal } from '@core/ui/vault/chain/address/AddressQRModal'
import { VaultPrimaryActions } from '@core/ui/vault/components/VaultPrimaryActions'
import { VaultChainCoin } from '@core/ui/vault/queries/useVaultChainCoinsQuery'
import { Opener } from '@lib/ui/base/Opener'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { ModalCloseButton } from '@lib/ui/modal/ModalCloseButton'
import { ResponsiveModal } from '@lib/ui/modal/ResponsiveModal'
import { OnCloseProp } from '@lib/ui/props'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { formatAmount } from '@lib/utils/formatAmount'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type CoinDetailModalProps = OnCloseProp & {
  coin: VaultChainCoin
}

export const CoinDetailModal = ({ coin, onClose }: CoinDetailModalProps) => {
  const { t } = useTranslation()
  const formatFiatAmount = useFormatFiatAmount()
  const balance = fromChainAmount(coin.amount, coin.decimals)
  const fiatValue = (coin.price || 0) * balance

  return (
    <ResponsiveModal
      grabbable
      isOpen
      onClose={onClose}
      modalProps={{
        withDefaultStructure: false,
      }}
    >
      <ContentContainer>
        <Header alignItems="start" justifyContent="flex-end" gap={16}>
          {onClose && <ModalCloseButton onClick={onClose} />}
        </Header>
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
              {t('price')}
            </Text>
            <NetworkBadge>
              <Text size={13} color="shyExtra">
                {formatFiatAmount(coin.price || 0)}
              </Text>
            </NetworkBadge>
          </InfoRow>

          <InfoRow>
            <Text size={14} weight={500}>
              {t('network')}
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

const Header = styled(HStack)`
  align-self: stretch;
  display: none;

  @media ${mediaQuery.tabletDeviceAndUp} {
    display: flex;
  }
`

const ContentContainer = styled(VStack)`
  margin-inline: -20px;
  position: relative;
  gap: 32px;
  padding: 20px 0px;
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

const BalanceCard = styled(VStack)`
  gap: 8px;
  align-items: center;
`

const InfoSection = styled(VStack)`
  gap: 16px;
  width: 100%;
  max-width: 400px;
  margin-top: 8px;
  padding-inline: 16px;
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

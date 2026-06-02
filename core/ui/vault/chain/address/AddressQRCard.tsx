import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { VaultAddressCopyToast } from '@core/ui/vault/page/components/VaultAddressCopyToast'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { Button } from '@lib/ui/buttons/Button'
import { centerContent } from '@lib/ui/css/centerContent'
import { round } from '@lib/ui/css/round'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { OnCloseProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useToast } from '@lib/ui/toast/ToastProvider'
import { Chain } from '@vultisig/core-chain/Chain'
import { CoinKey, CoinMetadata } from '@vultisig/core-chain/coin/Coin'
import { attempt } from '@vultisig/lib-utils/attempt'
import { toPng } from 'html-to-image'
import { useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import QRCode from 'react-qr-code'
import styled from 'styled-components'

type AddressQRCardProps = {
  chain: Chain
  coin?: CoinKey & Partial<Pick<CoinMetadata, 'logo' | 'ticker'>>
  onShare?: () => void
} & Partial<OnCloseProp>

const Container = styled(VStack)`
  gap: 24px;
  align-items: center;
  width: 100%;
`

const QRContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 232px;
  aspect-ratio: 232 / 272;
  border-radius: 24px;
  background: ${getColor('foreground')};
  display: flex;
  flex-direction: column;
  align-items: center;

  border-radius: 32px 32px 24px 24px;
  background: linear-gradient(180deg, #4879fd 0%, #0d39b1 100%);
  box-shadow:
    0 -3px 1px 0 rgba(0, 0, 0, 0.25) inset,
    0 1px 1px 0 rgba(255, 255, 255, 0.35) inset;
  padding: 8px 8px 16px 8px;
`

const QRWrapper = styled.div`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 32px 32px 24px 24px;

  overflow: hidden;
  background: white;
  padding: 16px;
  position: relative;
`

const ChainIconOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  ${sameDimensions(toSizeUnit(76))};
  ${round};
  ${centerContent};
  background: ${getColor('background')};
  border: 4px solid white;
  font-size: 48.5px;
  z-index: 1;
`

const ReceiveLabel = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  border-radius: 0 0 20px 20px;
  text-align: center;
`

const AddressText = styled(Text)`
  word-break: break-all;
  text-align: center;
  max-width: 220px;
`

const ButtonsRow = styled(HStack)`
  gap: 12px;
  width: 100%;
  max-width: 360px;
  margin-top: 8px;
`

const ShareButton = styled(Button)`
  flex: 1;
  border-radius: 40px;
  border: 2px solid ${({ theme }) => theme.colors.buttonPrimary.toCssValue()};
  background: transparent;
  color: ${getColor('contrast')};
  font-size: 14px;

  &:hover {
    background: ${({ theme }) =>
      theme.colors.buttonPrimary.withAlpha(0.1).toCssValue()};
  }
`

const CopyButton = styled(Button)`
  flex: 1;
  border-radius: 40px;
  background: ${({ theme }) => theme.colors.buttonPrimary.toCssValue()};
  color: ${getColor('contrast')};
  font-size: 14px;

  &:hover {
    background: ${({ theme }) =>
      theme.colors.buttonPrimary.withAlpha(0.8).toCssValue()};
  }
`

export const AddressQRCard = ({
  chain,
  coin,
  onShare,
  onClose,
}: AddressQRCardProps) => {
  const { t } = useTranslation()
  const address = useCurrentVaultAddress(chain)
  const { addToast } = useToast()
  const qrNodeRef = useRef<HTMLDivElement | null>(null)

  const displayName = coin?.ticker || chain

  const handleCopy = useCallback(async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      addToast({
        message: '',
        renderContent: () => <VaultAddressCopyToast value={chain} />,
      })
      onClose?.()
    }
  }, [address, addToast, chain, onClose])

  const handleShare = useCallback(async () => {
    if (onShare) {
      onShare()
      return
    }

    if (!address) return

    const shareTitle = `${t('receive')} ${displayName}`
    const node = qrNodeRef.current

    if (node && navigator.canShare) {
      const result = await attempt(async () => {
        const dataUrl = await toPng(node)
        const blob = await (await fetch(dataUrl)).blob()
        const file = new File([blob], `${displayName}.png`, {
          type: 'image/png',
        })

        if (!navigator.canShare({ files: [file] })) {
          throw new Error('File sharing not supported')
        }

        await navigator.share({
          files: [file],
          title: shareTitle,
          text: address,
        })
      })

      if ('data' in result) return
    }

    if (!navigator.share) return

    void navigator
      .share({
        title: shareTitle,
        text: address,
      })
      .catch(() => undefined)
  }, [address, displayName, onShare, t])

  if (!address) return null

  return (
    <Container>
      <QRContainer ref={qrNodeRef}>
        <QRWrapper>
          <QRCode
            value={address}
            size={256}
            style={{
              height: 'auto',
              maxWidth: '100%',
              width: '100%',
            }}
            fgColor="#000000"
            bgColor="#FFFFFF"
            level="H"
          />
          <ChainIconOverlay>
            {coin?.logo ? (
              <CoinIcon coin={coin} />
            ) : (
              <ChainEntityIcon value={getChainLogoSrc(chain)} />
            )}
          </ChainIconOverlay>
        </QRWrapper>
        <ReceiveLabel>
          <Text size={16} color="contrast">
            {t('receive')} {displayName}
          </Text>
        </ReceiveLabel>
      </QRContainer>

      <AddressText size={13} weight={500} color="contrast">
        {address}
      </AddressText>

      <ButtonsRow>
        <ShareButton onClick={handleShare}>{t('share')}</ShareButton>
        <CopyButton onClick={handleCopy}>{t('copy_address')}</CopyButton>
      </ButtonsRow>
    </Container>
  )
}

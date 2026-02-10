import { Button } from '@lib/ui/buttons/Button'
import { BatteryChargingIcon } from '@lib/ui/icons/BatteryChargingIcon'
import { SatelliteDishIcon } from '@lib/ui/icons/SatelliteDishIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { OnCloseProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const IllustrationWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 24px 0;
`

const IconCircle = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $color }) => `${$color}1A`};
`

const BulletItem = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;
`

const Bullet = styled.span`
  margin-top: 6px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.contrast.toCssValue()};
  flex-shrink: 0;
`

export const TronResourcesInfoModal = ({ onClose }: OnCloseProp) => {
  const { t } = useTranslation()

  return (
    <Modal onClose={onClose} withDefaultStructure={false} targetWidth={400}>
      <VStack gap={24} style={{ padding: '24px 24px 36px' }}>
        <IllustrationWrapper>
          <IconCircle $color="#13C89D">
            <SatelliteDishIcon style={{ fontSize: 24, color: '#13C89D' }} />
          </IconCircle>
          <IconCircle $color="#FFC25C">
            <BatteryChargingIcon style={{ fontSize: 24, color: '#FFC25C' }} />
          </IconCircle>
        </IllustrationWrapper>

        <Text
          size={20}
          weight="700"
          color="contrast"
          style={{ textAlign: 'center' }}
        >
          {t('tron_your_holdings')}
        </Text>

        <VStack gap={16}>
          <BulletItem>
            <Bullet />
            <Text size={14} weight="400" color="shyExtra" height="regular">
              <Text as="span" size={14} weight="700" color="contrast">
                {t('tron_bandwidth')}:{' '}
              </Text>
              {t('tron_bandwidth_description')}
            </Text>
          </BulletItem>

          <BulletItem>
            <Bullet />
            <Text size={14} weight="400" color="shyExtra" height="regular">
              <Text as="span" size={14} weight="700" color="contrast">
                {t('tron_energy')}:{' '}
              </Text>
              {t('tron_energy_description')}
            </Text>
          </BulletItem>
        </VStack>

        <Button onClick={onClose}>{t('tron_got_it')}</Button>
      </VStack>
    </Modal>
  )
}

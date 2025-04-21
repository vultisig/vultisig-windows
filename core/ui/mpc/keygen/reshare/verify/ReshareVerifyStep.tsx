import { getKeygenThreshold } from '@core/mpc/getKeygenThreshold'
import { ReshareDeviceItem } from '@core/ui/mpc/keygen/reshare/verify/ReshareDeviceItem'
import { useMpcDevices } from '@core/ui/mpc/state/mpcDevices'
import { useMpcLocalPartyId } from '@core/ui/mpc/state/mpcLocalPartyId'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Button } from '@lib/ui/buttons/Button'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { centerContent } from '@lib/ui/css/centerContent'
import { horizontalPadding } from '@lib/ui/css/horizontalPadding'
import { FlowPageHeader } from '@lib/ui/flow/FlowPageHeader'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { InfoBlock } from '@lib/ui/status/InfoBlock'
import { Text, text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { without } from '@lib/utils/array/without'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const Pill = styled.div`
  height: 32px;
  ${horizontalPadding(12)};
  ${borderRadius.s};
  ${centerContent};
  ${text({
    color: 'contrast',
    size: 14,
    weight: 600,
  })}
  background: ${getColor('foreground')};
`

export const ReshareVerifyStep: React.FC<OnBackProp & OnFinishProp> = ({
  onBack,
  onFinish,
}) => {
  const { t } = useTranslation()

  const devices = useMpcDevices()
  const localPartyId = useMpcLocalPartyId()
  const { signers } = useCurrentVault()

  const thresholdText = `${getKeygenThreshold(devices.length)} ${t('of')} ${devices.length}`

  return (
    <>
      <FlowPageHeader title={t('changes_in_setup')} onBack={onBack} />
      <PageContent>
        <VStack flexGrow gap={32}>
          <VStack alignItems="center" gap={20}>
            <Text family="mono" weight="700" size={14}>
              {t('new_vault_setup')}
            </Text>
            <Pill>{thresholdText}</Pill>
          </VStack>
          <VStack gap={16}>
            {devices.map((device, index) => (
              <ReshareDeviceItem
                isActive={device === localPartyId}
                key={device}
                status="add"
                value={device}
                index={index}
              />
            ))}
            {without(signers, ...devices).map(device => (
              <ReshareDeviceItem
                isActive={false}
                key={device}
                status="remove"
                value={device}
                index={signers.indexOf(device)}
              />
            ))}
          </VStack>
        </VStack>
        <VStack gap={20}>
          <InfoBlock>{t('new_vault_setup_disclaimer')}</InfoBlock>
          <Button onClick={onFinish}>{t('start')}</Button>
        </VStack>
      </PageContent>
    </>
  )
}

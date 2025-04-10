import { borderRadius } from '@lib/ui/css/borderRadius'
import { horizontalPadding } from '@lib/ui/css/horizontalPadding'
import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import { hStack } from '@lib/ui/layout/Stack'
import { IndexProp, IsActiveProp, StatusProp, ValueProp } from '@lib/ui/props'
import { text } from '@lib/ui/text'
import { match } from '@lib/utils/match'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import {
  formatMpcDeviceName,
  parseLocalPartyId,
} from '../../../mpc/localPartyId'

type ReshareDeviceStatus = 'add' | 'remove'

type ReshareDeviceItemProps = ValueProp<string> &
  IndexProp &
  IsActiveProp &
  StatusProp<ReshareDeviceStatus>

const Container = styled.div<StatusProp<ReshareDeviceStatus>>`
  height: ${toSizeUnit(64)};
  ${horizontalPadding(20)};
  ${borderRadius.m};
  ${text({
    color: 'supporting',
    size: 14,
    weight: 700,
  })}

  ${hStack({
    alignItems: 'center',
  })}

  background: ${({ status, theme: { colors } }) =>
    match(status, {
      add: () => colors.primary.getVariant({ a: () => 0.5 }),
      remove: () => colors.danger.getVariant({ a: () => 0.35 }),
    }).toCssValue()};
`

export const ReshareDeviceItem: React.FC<ReshareDeviceItemProps> = ({
  value,
  index,
  isActive,
  status,
}) => {
  const { deviceName } = parseLocalPartyId(value)

  const { t } = useTranslation()

  return (
    <Container status={status}>
      {index + 1}. {formatMpcDeviceName(deviceName)} (
      {isActive
        ? t('this_device')
        : match(status, {
            add: () => t('pair_device'),
            remove: () => t('backup_device'),
          })}
      )
    </Container>
  )
}

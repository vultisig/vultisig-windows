import { getKeygenThreshold } from '@core/mpc/getKeygenThreshold'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { useBoolean } from '@lib/ui/hooks/useBoolean'
import { CircleInfoIcon } from '@lib/ui/icons/CircleInfoIcon'
import { CrossIcon } from '@lib/ui/icons/CrossIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

type PeerRequirementsInfoProps = {
  target: number
}

export const PeerRequirementsInfo: FC<PeerRequirementsInfoProps> = ({
  target,
}) => {
  const { t } = useTranslation()
  const [shouldShow, { unset: hide }] = useBoolean(true)
  const min = getKeygenThreshold(target)

  return shouldShow ? (
    <Panel>
      <HStack alignItems="center" gap={12}>
        <CircleInfoIcon fontSize={16} />
        <Text color="shy" size={13} weight={500}>
          {t('scanQrInstruction', { max: target, min })}
        </Text>
        <IconButton onClick={hide}>
          <CrossIcon />
        </IconButton>
      </HStack>
    </Panel>
  ) : null
}

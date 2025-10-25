import { IconButton } from '@lib/ui/buttons/IconButton'
import { useBoolean } from '@lib/ui/hooks/useBoolean'
import { CircleInfoIcon } from '@lib/ui/icons/CircleInfoIcon'
import { CrossIcon } from '@lib/ui/icons/CrossIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { minKeygenDevices, recommendedKeygenDevices } from './config'

export const KeygenDevicesRequirementsInfo = () => {
  const { t } = useTranslation()
  const [shouldShow, { unset: hide }] = useBoolean(true)

  return shouldShow ? (
    <Panel>
      <HStack alignItems="center" gap={12}>
        <CircleInfoIcon fontSize={16} />
        <Text color="shy" size={13} weight={500}>
          {t('keygen_devices_requirements_info', {
            recommended: recommendedKeygenDevices,
            min: minKeygenDevices,
          })}
        </Text>
        <IconButton onClick={hide}>
          <CrossIcon />
        </IconButton>
      </HStack>
    </Panel>
  ) : null
}

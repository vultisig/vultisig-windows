import { WarningBlock } from '@lib/ui/status/WarningBlock'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useUnscannedChains } from '../state/unscannedChains'

/**
 * Names the chains the scan could not check, so a user with funds there
 * knows to select them manually. Renders nothing when every chain was checked.
 */
export const UnscannedChainsWarning = () => {
  const { t } = useTranslation()
  const [unscannedChains] = useUnscannedChains()

  if (unscannedChains.length === 0) return null

  return (
    <WarningBlock>
      {t('unscanned_chains_warning')}
      <br />
      <Text as="span" weight={600}>
        {unscannedChains.join(', ')}
      </Text>
    </WarningBlock>
  )
}

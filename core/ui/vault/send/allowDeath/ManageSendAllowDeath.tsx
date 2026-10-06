import { Switch } from '@lib/ui/inputs/switch'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useSendAllowDeath } from './useSendAllowDeath'

/**
 * Lets a native Polkadot or Bittensor send empty the account. Off by default;
 * while on, the send moves the whole balance less the fee and the chain
 * deactivates the account.
 */
export const ManageSendAllowDeath = () => {
  const { t } = useTranslation()
  const { isAvailable, isEnabled, setEnabled } = useSendAllowDeath()

  if (!isAvailable) return null

  return (
    <VStack gap={4}>
      <Switch
        checked={isEnabled}
        label={t('substrate_allow_death_toggle')}
        onChange={setEnabled}
      />
      <Text size={12} color="shy">
        {t('substrate_allow_death_description')}
      </Text>
    </VStack>
  )
}

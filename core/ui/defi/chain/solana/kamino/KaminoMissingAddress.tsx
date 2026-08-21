import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

/**
 * Shown when the current vault has no Solana address — a key-import vault
 * without a Solana public key. There is nothing to deposit from or withdraw
 * to, and the position read is disabled without an address, so saying so beats
 * a spinner that never resolves.
 */
export const KaminoMissingAddress = () => {
  const { t } = useTranslation()

  return (
    <VStack flexGrow alignItems="center" justifyContent="center" gap={8}>
      <Text size={14} color="shy" centerHorizontally>
        {t('kamino_earn_no_solana_address')}
      </Text>
    </VStack>
  )
}

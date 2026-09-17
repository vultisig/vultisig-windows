import { useTonGaslessSend } from '@core/ui/vault/send/fee/tonGasless/useTonGaslessSend'
import { useCurrentSendCoin } from '@core/ui/vault/send/state/sendCoin'
import { Switch } from '@lib/ui/inputs/switch'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

/**
 * Lets a TON jetton send pay its network fee in the jetton itself through the
 * gasless relay. Shown only when the relay takes this jetton and the account is
 * a W5 wallet; the default follows the account's TON balance.
 */
export const ManageTonGaslessFee = () => {
  const { t } = useTranslation()
  const { ticker } = useCurrentSendCoin()
  const { isAvailable, isEnabled, setEnabled } = useTonGaslessSend()

  if (!isAvailable) return null

  return (
    <VStack gap={4}>
      <Switch
        checked={isEnabled}
        label={t('ton_gasless_pay_fee_in_token', { ticker })}
        onChange={setEnabled}
      />
      <Text size={12} color="shy">
        {t('ton_gasless_description', { ticker })}
      </Text>
    </VStack>
  )
}

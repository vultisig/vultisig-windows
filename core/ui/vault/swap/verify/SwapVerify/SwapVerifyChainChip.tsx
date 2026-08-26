import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { HStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { Chain } from '@vultisig/core-chain/Chain'
import { useTranslation } from 'react-i18next'

const logoSize = 20

/**
 * Names the network a swap amount settles on. A ticker alone does not say which
 * chain the asset lives on, and a payout that lands on the wrong one is not
 * recoverable — so the destination states its chain at the point of approval.
 */
export const SwapVerifyChainChip = ({ value }: ValueProp<Chain>) => {
  const { t } = useTranslation()

  return (
    <HStack alignItems="center" gap={6}>
      <ChainEntityIcon
        value={getChainLogoSrc(value)}
        style={{ fontSize: logoSize }}
      />
      <Text color="shy" size={13} cropped>
        {t('on_chain', { chain: value })}
      </Text>
    </HStack>
  )
}

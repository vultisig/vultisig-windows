import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import {
  ContainerWrapper,
  HorizontalLine,
} from '@core/ui/vault/swap/verify/SwapVerify/SwapVerify.styled'
import { borderRadiusPx } from '@lib/ui/css/borderRadius'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { KeysignLimitSwapCancel } from '@vultisig/core-mpc/keysign/swap/getKeysignLimitSwapCancel'
import { fromCommCoin } from '@vultisig/core-mpc/types/utils/commCoin'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { formatWalletAddress } from '@vultisig/lib-utils/formatWalletAddress'
import { assertField } from '@vultisig/lib-utils/record/assertField'
import { useTranslation } from 'react-i18next'

import { JoinKeysignNetworkFeeValue } from './JoinKeysignNetworkFeeValue'

type Props = ValueProp<KeysignPayload> & {
  cancel: KeysignLimitSwapCancel
}

/**
 * Joiner verify view for a THORChain limit-order cancellation.
 *
 * Without it the payload falls through to the generic transfer view, which is
 * worse than uninformative here: a cancel carries no swap payload on any branch,
 * so a co-signer sees a send of a trivial amount to an opaque address — dust
 * that reads as harmless while the transaction closes a position.
 *
 * Deliberately shows NO headline amount. A cancel moves no funds by design: the
 * THORChain route is a memo-only deposit whose amount is literally zero, and the
 * L1 route attaches dust only so Bifrost observes it. Neither is a transfer the
 * user is making, so a hero built around one reports a figure that is an artifact
 * of reusing the send screen. The dust is not hidden — it is disclosed as a cost
 * row beside the network fee, where it reads as what it is.
 *
 * Every value here is decoded from the memo the payload already carries — the
 * exact string THORChain executes — rather than from a display field the
 * initiating device supplied alongside it and a co-signer could not verify.
 */
export const JoinKeysignLimitOrderCancelVerify = ({ value, cancel }: Props) => {
  const { t } = useTranslation()
  const vault = useCurrentVault()

  const signingCoin = fromCommCoin(assertField(value, 'coin'))
  const attachedDust = fromChainAmount(
    BigInt(value.toAmount),
    signingCoin.decimals
  )

  return (
    <ContainerWrapper radius={borderRadiusPx.lg}>
      <VStack
        bgColor="foreground"
        gap={20}
        padding={24}
        radius={borderRadiusPx.lg}
      >
        <VStack gap={4}>
          <Text color="contrast" size={17} weight="500">
            {t('swap_limit_cancel_verify_title')}
          </Text>
          {/* THORChain's own spelling of the pair, straight out of the memo, so
              nothing shown here can disagree with what is signed. */}
          <Text size={13} color="shy">
            {`${cancel.sourceAsset} → ${cancel.targetAsset}`}
          </Text>
        </VStack>
        <HorizontalLine />
        <HStack alignItems="center" justifyContent="space-between" gap={12}>
          <Text size={14} color="shy">
            {t('swap_limit_review_target_price')}
          </Text>
          <Text size={14} color="contrast">
            {`${cancel.sourceAmountDecimal} → ${cancel.tradeTargetDecimal}`}
          </Text>
        </HStack>
        <HorizontalLine />
        <HStack
          alignItems="center"
          justifyContent="space-between"
          gap={12}
          wrap="wrap"
        >
          <Text size={14} color="shy">
            {t('vault')}
          </Text>
          <Text size={14} color="contrast">
            {vault.name}{' '}
            <Text as="span" color="shy">
              ({formatWalletAddress(signingCoin.address)})
            </Text>
          </Text>
        </HStack>
        {attachedDust > 0 ? (
          <>
            <HorizontalLine />
            <HStack alignItems="center" justifyContent="space-between" gap={12}>
              <Text size={14} color="shy">
                {t('swap_limit_cancel_donated_dust_row')}
              </Text>
              <Text size={14} color="contrast">
                {formatAmount(attachedDust, { ticker: signingCoin.ticker })}
              </Text>
            </HStack>
          </>
        ) : null}
        <HorizontalLine />
        <HStack alignItems="center" justifyContent="space-between" gap={12}>
          <Text size={14} color="shy">
            {t('network_fee')}
          </Text>
          <JoinKeysignNetworkFeeValue value={value} />
        </HStack>
        <HorizontalLine />
        <Text size={12} color="shy">
          {t('swap_limit_cancel_explanation')}
        </Text>
      </VStack>
    </ContainerWrapper>
  )
}

import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { ReviewRow } from '@core/ui/mpc/keysign/review/ReviewRow'
import { KeysignFeeAmount } from '@core/ui/mpc/keysign/tx/FeeAmount'
import { useDepositKeysignPayloadQuery } from '@core/ui/vault/deposit/keysignPayload/query'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { Chain } from '@vultisig/core-chain/Chain'
import { useTranslation } from 'react-i18next'

/** The chain the deposit lands on, with its logo. */
export const DepositNetworkRow = ({ value }: ValueProp<Chain>) => {
  const { t } = useTranslation()

  return (
    <ReviewRow
      label={t('network')}
      value={
        <>
          <ChainEntityIcon
            value={getChainLogoSrc(value)}
            style={{ fontSize: 16 }}
          />
          {value}
        </>
      }
    />
  )
}

/** The estimated network fee of the deposit's payload, stacked over its fiat value. */
export const DepositFeeRow = () => {
  const { t } = useTranslation()
  const keysignPayloadQuery = useDepositKeysignPayloadQuery()

  return (
    <ReviewRow
      label={t('est_network_fee')}
      value={
        <MatchQuery
          value={keysignPayloadQuery}
          pending={() => <Spinner />}
          success={payload => (
            <KeysignFeeAmount keysignPayload={payload} layout="stacked" />
          )}
          error={() => (
            <Text as="span" size={14} color="shy">
              —
            </Text>
          )}
        />
      }
    />
  )
}

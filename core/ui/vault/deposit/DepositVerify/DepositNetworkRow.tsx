import { ValueProp } from '@lib/ui/props'
import { Chain } from '@vultisig/core-chain/Chain'
import { useTranslation } from 'react-i18next'

import { ChainEntityIcon } from '../../../chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '../../../chain/metadata/getChainLogoSrc'
import { ReviewRow } from '../../../mpc/keysign/review/ReviewRow'

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

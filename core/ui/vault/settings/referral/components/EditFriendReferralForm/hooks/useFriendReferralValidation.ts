import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { useTranslation } from 'react-i18next'

import { useCurrentVaultAddress } from '../../../../../state/currentVaultCoins'
import { useUserValidThorchainNameQuery } from '../../../queries/useUserValidThorchainNameQuery'
import { ValidThorchainNameDetails } from '../../../services/getUserValidThorchainName'

export const useFriendReferralValidation = (input: string) => {
  const address = useCurrentVaultAddress(chainFeeCoin.THORChain.chain)
  const {
    data: {
      name: lookedUpName = '',
      aliases = [],
    } = {} as ValidThorchainNameDetails,
  } = useUserValidThorchainNameQuery(address)

  const { t } = useTranslation()
  const tooLong = input.length > 4
  const badChars = !/^[A-Za-z0-9]*$/.test(input)
  const isOwn = input.toLowerCase() === lookedUpName?.toLowerCase()
  const exists = Boolean(lookedUpName)
  const hasThorAlias = Boolean(
    aliases?.some(
      alias => alias.chain?.toUpperCase() === 'THOR' && alias.address
    )
  )

  return isOwn
    ? t('used_referral_error')
    : tooLong
      ? t('tns_max_4_chars')
      : badChars
        ? t('tns_alnum_only')
        : input && !exists
          ? t('tns_not_found')
          : input && exists && !hasThorAlias
            ? t('tns_missing_thor_alias')
            : undefined
}

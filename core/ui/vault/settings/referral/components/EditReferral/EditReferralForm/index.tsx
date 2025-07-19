import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { areEqualCoins } from '@core/chain/coin/Coin'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { StackSeparatedBy } from '@lib/ui/layout/StackSeparatedBy'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { OnFinishProp } from '@lib/ui/props'
import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { useCurrentVaultCoins } from '../../../../../state/currentVaultCoins'
import { useEditReferralFormData } from '../../../providers/EditReferralFormProvider'
import { useReferralPayoutAsset } from '../../../providers/ReferralPayoutAssetProvider'
import { ValidThorchainNameDetails } from '../../../services/getUserValidThorchainName'
import { DecorationLine, ReferralPageWrapper } from '../../Referrals.styled'
import { ExpirationField } from './Fields/ExpirationField'
import { Fees } from './Fields/Fees'
import { PayoutAssetField } from './Fields/PayoutAssetField'
import { ReferralCodeField } from './Fields/ReferralCodeField'

type Props = {
  nameDetails: ValidThorchainNameDetails
} & OnFinishProp

export const EditReferralForm = ({ onFinish, nameDetails }: Props) => {
  const { t } = useTranslation()

  const {
    setValue,
    watch,
    formState: { isValid, isSubmitting },
  } = useEditReferralFormData()

  const [referralPayoutAsset, setReferralPayoutAsset] = useReferralPayoutAsset()
  const initialReferralPayoutAsset = useRef(referralPayoutAsset)

  const initialExpiration = useMemo(
    () => Math.ceil(nameDetails.remainingYears),
    [nameDetails.remainingYears]
  )

  const coins = useCurrentVaultCoins()
  const prefCoin = coins.find(coin =>
    areEqualCoins(coin, {
      chain: nameDetails?.preferred_asset?.split(
        '.'
      )[0] as (typeof chainFeeCoin)[keyof typeof chainFeeCoin]['chain'],
      id: nameDetails?.preferred_asset?.split('.')[1].split('-')[0] || '',
    })
  )

  const currentExpiration = watch('expiration')
  const expirationChanged =
    currentExpiration !== initialExpiration &&
    currentExpiration > initialExpiration
  const assetChanged = prefCoin
    ? referralPayoutAsset !== prefCoin
    : referralPayoutAsset !== initialReferralPayoutAsset.current
  const hasChanges = expirationChanged || assetChanged

  useEffect(() => {
    setValue('expiration', initialExpiration)
    if (prefCoin) setReferralPayoutAsset(prefCoin)
  }, [initialExpiration, prefCoin, setValue, setReferralPayoutAsset])

  const isDisabled = useMemo(() => {
    if (currentExpiration <= initialExpiration) {
      return `Expiration must be greater than ${initialExpiration}`
    } else if (!isValid || isSubmitting || !hasChanges) {
      return true
    }
  }, [currentExpiration, hasChanges, initialExpiration, isSubmitting, isValid])

  return (
    <VStack flexGrow gap={40}>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('title_1')}
      />
      <ReferralPageWrapper
        onSubmit={onFinish}
        as="form"
        data-testid="CreateReferralForm-Wrapper"
        flexGrow
        justifyContent="space-between"
      >
        <VStack flexGrow justifyContent="space-between">
          <StackSeparatedBy
            direction="column"
            separator={<DecorationLine />}
            gap={14}
          >
            <ReferralCodeField />
            <PayoutAssetField />
            <ExpirationField initialExpiration={initialExpiration} />
            <Fees />
          </StackSeparatedBy>
          <Button disabled={isDisabled} type="submit">
            Edit Referral
          </Button>
        </VStack>
      </ReferralPageWrapper>
    </VStack>
  )
}

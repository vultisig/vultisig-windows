import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { areEqualCoins } from '@core/chain/coin/Coin'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { StackSeparatedBy } from '@lib/ui/layout/StackSeparatedBy'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { OnFinishProp } from '@lib/ui/props'
import { useEffect } from 'react'
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
    formState: { isValid, isSubmitting },
  } = useEditReferralFormData()

  const [referralPayoutAsset, setReferralPayoutAsset] = useReferralPayoutAsset()

  const coins = useCurrentVaultCoins()
  const prefCoin = coins.find(coin =>
    areEqualCoins(coin, {
      chain: nameDetails?.preferred_asset?.split(
        '.'
      )[0] as (typeof chainFeeCoin)[keyof typeof chainFeeCoin]['chain'],
      id: nameDetails?.preferred_asset?.split('.')[1].split('-')[0] || '', //то  drop any pool-tail
    })
  )

  useEffect(() => {
    setValue('expiration', Math.ceil(nameDetails.remainingYears))

    if (prefCoin) {
      setReferralPayoutAsset(referralPayoutAsset)
    }
  }, [
    nameDetails.remainingYears,
    prefCoin,
    referralPayoutAsset,
    setReferralPayoutAsset,
    setValue,
  ])

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
            <ExpirationField />
            <Fees />
          </StackSeparatedBy>
          <Button disabled={!isValid || isSubmitting} type="submit">
            Edit Referral
          </Button>
        </VStack>
      </ReferralPageWrapper>
    </VStack>
  )
}

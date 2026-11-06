import { SettingsCtaButton } from '@core/ui/settings/SettingsCtaButton'
import { SettingsPageHeader } from '@core/ui/settings/SettingsPageHeader'
import { VStack } from '@lib/ui/layout/Stack'
import { StackSeparatedBy } from '@lib/ui/layout/StackSeparatedBy'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { Chain } from '@vultisig/core-chain/Chain'
import { areEqualCoins } from '@vultisig/core-chain/coin/Coin'
import { useEffect, useMemo, useRef } from 'react'
import { useFormState, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useCurrentVaultCoins } from '../../../../../state/currentVaultCoins'
import { useCanAffordReferral } from '../../../hooks/useCanAffordReferral'
import { useEditReferralFormData } from '../../../providers/EditReferralFormProvider'
import { useReferralPayoutAsset } from '../../../providers/ReferralPayoutAssetProvider'
import { ValidThorchainNameDetails } from '../../../services/getUserValidThorchainName'
import {
  DecorationLine,
  FormFieldErrorText,
  ReferralFormContent,
  ReferralFormFooter,
} from '../../Referrals.styled'
import { ExpirationField } from './Fields/ExpirationField'
import { Fees } from './Fields/Fees'
import { PayoutAssetField } from './Fields/PayoutAssetField'
import { ReferralCodeField } from './Fields/ReferralCodeField'

type Props = {
  nameDetails: ValidThorchainNameDetails
} & OnFinishProp &
  OnBackProp

/**
 * Form for editing the vault's own THORName referral. Header back hands
 * control to `onBack` so the parent referral view can return to Your Referrals.
 */
export const EditReferralForm = ({ onFinish, onBack, nameDetails }: Props) => {
  const { t } = useTranslation()
  const { control, setValue } = useEditReferralFormData()
  const { isValid, isSubmitting } = useFormState({ control })

  const [referralPayoutAsset, setReferralPayoutAsset] = useReferralPayoutAsset()
  const initialReferralPayoutAsset = useRef(referralPayoutAsset)

  const initialExpiration = useMemo(
    () => Math.ceil(nameDetails.remainingYears),
    [nameDetails.remainingYears]
  )

  const feeAmount = useWatch({ control, name: 'referralFeeAmount' })
  const currentExpiration = useWatch({ control, name: 'expiration' })

  const canAfford = useCanAffordReferral(feeAmount)
  const error = canAfford ? undefined : t('insufficient_balance')

  const coins = useCurrentVaultCoins()
  const prefCoin = useMemo(() => {
    if (!nameDetails?.preferred_asset) return undefined

    const parts = nameDetails.preferred_asset.split('.')
    if (parts.length < 2) return undefined

    const [chain, assetPart] = parts
    const id = assetPart.split('-')[0]

    if (!chain || !id) return undefined

    return coins.find(coin =>
      areEqualCoins(coin, {
        chain: chain as Chain,
        id,
      })
    )
  }, [coins, nameDetails?.preferred_asset])

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
    if (currentExpiration <= initialExpiration) return true
    if (!isValid || isSubmitting || !hasChanges || error) return true
  }, [
    currentExpiration,
    error,
    hasChanges,
    initialExpiration,
    isSubmitting,
    isValid,
  ])

  return (
    <VStack flexGrow>
      <SettingsPageHeader onBack={onBack} title={t('edit_referral')} />
      <VStack
        onSubmit={onFinish}
        as="form"
        data-testid="CreateReferralForm-Wrapper"
        flexGrow
        style={{ minHeight: 0 }}
      >
        <ReferralFormContent flexGrow scrollable>
          <StackSeparatedBy
            direction="column"
            separator={<DecorationLine />}
            gap={14}
          >
            <ReferralCodeField />
            <ExpirationField initialExpiration={initialExpiration} />
            <PayoutAssetField />
            <Fees />
          </StackSeparatedBy>
        </ReferralFormContent>
        <ReferralFormFooter gap={4}>
          <SettingsCtaButton disabled={isDisabled} type="submit">
            {t('save_changes')}
          </SettingsCtaButton>
          {error && <FormFieldErrorText>{error}</FormFieldErrorText>}
        </ReferralFormFooter>
      </VStack>
    </VStack>
  )
}

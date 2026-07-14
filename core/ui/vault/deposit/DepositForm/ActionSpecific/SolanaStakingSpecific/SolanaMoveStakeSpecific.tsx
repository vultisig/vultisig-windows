import { SolanaValidatorPickerField } from '@core/ui/chain/solana/staking/components/SolanaValidatorPickerField'
import { useSolanaValidatorsQuery } from '@core/ui/chain/solana/staking/queries/useSolanaValidatorsQuery'
import { useDepositCoin } from '@core/ui/vault/deposit/providers/DepositCoinProvider'
import { useDepositFormHandlers } from '@core/ui/vault/deposit/providers/DepositFormHandlersProvider'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { approximateCooldownDays } from '@vultisig/core-chain/chains/solana/staking/cooldownGate'
import {
  truncatedPubkey,
  validatorDisplayName,
} from '@vultisig/core-chain/chains/solana/staking/models/validator'
import { Controller, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

/**
 * Solana move-stake (step 1: deactivate) form — mirrors iOS
 * `SolanaMoveStakeTransactionScreen`. Solana has no native redelegate, so
 * moving A → B is a guided, cross-epoch flow: this step deactivates the chosen
 * stake account (starting the ~1-epoch cooldown); once it is fully inactive the
 * DeFi tab surfaces "Finish Move" to re-delegate it to the new validator. The
 * whole account moves (no partial split — wallet-core exposes no Split
 * instruction), so there is no amount.
 *
 * The destination validator is picked HERE even though the re-delegation only
 * happens days later: deactivating starts an irreversible cooldown, so the move
 * target has to be known before committing to it. The pick is remembered per
 * stake account (`solanaMoveStakeDestinations`) and prefills finish-move.
 */
export const SolanaMoveStakeSpecific = () => {
  const { t } = useTranslation()
  const [{ control }] = useDepositFormHandlers()
  const [coin] = useDepositCoin()
  const { data: validators } = useSolanaValidatorsQuery()

  const watchedStakeAccount = useWatch({ control, name: 'stakeAccount' })
  const stakeAccount =
    typeof watchedStakeAccount === 'string' ? watchedStakeAccount : undefined

  const watchedSrcValidator = useWatch({ control, name: 'srcValidatorAddress' })
  const srcValidatorAddress =
    typeof watchedSrcValidator === 'string' ? watchedSrcValidator : undefined
  const srcValidator = srcValidatorAddress
    ? validators?.find(v => v.votePubkey === srcValidatorAddress)
    : undefined

  return (
    <VStack gap={16} flexGrow>
      <Card>
        <Row>
          <Text size={14} color="regular">
            {t('solana_staking_stake_account')}
          </Text>
          <Text size={14} color="shy" family="mono">
            {truncatedPubkey(stakeAccount ?? '')}
          </Text>
        </Row>
        {srcValidatorAddress ? (
          <Row>
            <Text size={14} color="regular">
              {t('solana_staking_current_validator')}
            </Text>
            <Text size={14} color="shy">
              {srcValidator
                ? validatorDisplayName(srcValidator)
                : truncatedPubkey(srcValidatorAddress)}
            </Text>
          </Row>
        ) : null}
      </Card>
      <Controller
        control={control}
        name="validatorAddress"
        render={({ field }) => (
          <SolanaValidatorPickerField
            ticker={coin.ticker}
            label={t('solana_staking_new_validator')}
            value={typeof field.value === 'string' ? field.value : undefined}
            excludeVotePubkey={srcValidatorAddress}
            onChange={field.onChange}
          />
        )}
      />
      <Notice>
        <Text size={13} color="shy">
          {t('solana_staking_move_notice', {
            days: approximateCooldownDays(1),
          })}
        </Text>
      </Notice>
    </VStack>
  )
}

const Card = styled(VStack).attrs({ gap: 12 })`
  padding: 16px;
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 12px;
`

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

const Notice = styled.div`
  padding: 12px 16px;
  border-radius: 12px;
  background: ${getColor('foreground')};
`

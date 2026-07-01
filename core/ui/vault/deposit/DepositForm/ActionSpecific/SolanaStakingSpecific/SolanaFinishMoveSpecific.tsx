import { SolanaValidatorPickerField } from '@core/ui/chain/solana/staking/components/SolanaValidatorPickerField'
import { useDepositCoin } from '@core/ui/vault/deposit/providers/DepositCoinProvider'
import { useDepositFormHandlers } from '@core/ui/vault/deposit/providers/DepositFormHandlersProvider'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { truncatedPubkey } from '@vultisig/core-chain/chains/solana/staking/models/validator'
import { Controller, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

/**
 * Solana move-stake (step 2: re-delegate) form — mirrors iOS
 * `SolanaFinishMoveTransactionScreen`. Reached once the moved stake account has
 * cooled down (the DeFi tab surfaces "Finish Move" on a fully-inactive account).
 * Shows the source account read-only and an inline validator picker for the
 * destination; the (prefilled) re-delegatable amount rides hidden on the form.
 * Continue is gated by the schema (validator required), so no custom footer.
 */
export const SolanaFinishMoveSpecific = () => {
  const { t } = useTranslation()
  const [{ control }] = useDepositFormHandlers()
  const [coin] = useDepositCoin()
  const stakeAccount = useWatch({ control, name: 'stakeAccount' }) as
    | string
    | undefined

  return (
    <Layout>
      <Card>
        <Row>
          <Text size={14} color="regular">
            {t('solana_staking_stake_account')}
          </Text>
          <Text size={14} color="shy" family="mono">
            {truncatedPubkey(stakeAccount ?? '')}
          </Text>
        </Row>
      </Card>
      <Controller
        control={control}
        name="validatorAddress"
        render={({ field }) => (
          <SolanaValidatorPickerField
            ticker={coin.ticker}
            value={field.value as string | undefined}
            onChange={field.onChange}
          />
        )}
      />
      <Notice>
        <Text size={13} color="shy">
          {t('solana_staking_finish_move_notice')}
        </Text>
      </Notice>
    </Layout>
  )
}

const Layout = styled(VStack).attrs({ gap: 16 })``

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

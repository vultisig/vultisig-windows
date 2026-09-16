import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { CoinTicker } from '@core/ui/vault/chain/CoinTicker'
import {
  ActionFormCheckBadge,
  ActionFormIconsWrapper,
} from '@core/ui/vault/components/action-form/ActionFormIconsWrapper'
import { SendInputContainer } from '@core/ui/vault/send/components/SendInputContainer'
import { useSendValidationQuery } from '@core/ui/vault/send/queries/useSendValidationQuery'
import { useSendFormFieldState } from '@core/ui/vault/send/state/formFields'
import { useCurrentSendCoin } from '@core/ui/vault/send/state/sendCoin'
import { CheckmarkIcon } from '@lib/ui/icons/CheckmarkIcon'
import { PencilIcon } from '@lib/ui/icons/PenciIcon'
import { HStack, hStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const ManageSendCoinCollapsedInputField = () => {
  const coin = useCurrentSendCoin()
  const { ticker } = coin
  const { t } = useTranslation()
  const [{ field }, setFocusedSendField] = useSendFormFieldState()

  const { data } = useSendValidationQuery()
  const coinError = data?.coin

  const isOpen = field === 'coin'
  const isChecked = coin && !isOpen && !coinError

  return (
    <CollapsedCoinInputContainer
      data-testid="send-coin-field"
      onClick={() => {
        setFocusedSendField(state => ({
          ...state,
          field: 'coin',
        }))
      }}
    >
      <AssetRow gap={12} alignItems="center">
        <Text size={14} nowrap>
          {t('asset')}
        </Text>
        <CoinRow gap={4} alignItems="center">
          <CoinIcon coin={coin} style={{ fontSize: 20 }} />
          <CoinTicker ticker={ticker} size={12} color="shy" />
        </CoinRow>
      </AssetRow>
      <ActionFormIconsWrapper gap={12}>
        {isChecked && (
          <>
            <ActionFormCheckBadge>
              <CheckmarkIcon />
            </ActionFormCheckBadge>
            {!isOpen && (
              <PencilIconWrapper>
                <PencilIcon />
              </PencilIconWrapper>
            )}
          </>
        )}
      </ActionFormIconsWrapper>
    </CollapsedCoinInputContainer>
  )
}

const CollapsedCoinInputContainer = styled(SendInputContainer)`
  ${hStack({
    justifyContent: 'space-between',
    alignItems: 'center',
  })}
`

/**
 * Holds the label and the coin. It has to be allowed to shrink, or the ticker
 * beside it has no width to be cropped against.
 */
const AssetRow = styled(HStack)`
  min-width: 0;
`

const CoinRow = styled(HStack)`
  min-width: 0;

  svg,
  img {
    flex-shrink: 0;
  }
`

const PencilIconWrapper = styled.div`
  color: ${getColor('contrast')};
`

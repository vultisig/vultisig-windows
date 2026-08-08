import { borderRadius } from '@lib/ui/css/borderRadius'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { matchColor } from '@lib/ui/theme/getters'
import { MiddleTruncate } from '@lib/ui/truncate'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type SwapExternalRecipientWarningKind = 'warning' | 'danger'

type SwapExternalRecipientWarningProps = {
  address: string
  kind?: SwapExternalRecipientWarningKind
}

/**
 * Stateless warning row shown on the swap verify screen when the output is
 * routed to an external address. `kind` controls the emphasis colour:
 * `warning` (amber, matches `WarningBlock`) or `danger` (red, matches
 * `ErrorBlock`).
 */
export const SwapExternalRecipientWarning = ({
  address,
  kind = 'warning',
}: SwapExternalRecipientWarningProps) => {
  const { t } = useTranslation()

  return (
    <Container kind={kind} gap={12} alignItems="center" fullWidth>
      <Icon kind={kind} />
      <VStack gap={2} flexGrow>
        <Text
          color={kind === 'danger' ? 'danger' : 'idle'}
          size={14}
          weight={500}
        >
          {t('swap_external_recipient_warning')}
        </Text>
        <MiddleTruncate text={address} color="textShy" size={13} />
      </VStack>
    </Container>
  )
}

type KindProp = { kind: SwapExternalRecipientWarningKind }

const Container = styled(HStack)<KindProp>`
  ${borderRadius.m};
  padding: 16px;
  background: ${({ kind, theme: { colors } }) =>
    (kind === 'danger'
      ? colors.dangerBackground
      : colors.idleDark
    ).toCssValue()};
  border: 1px solid
    ${({ kind, theme: { colors } }) =>
      (kind === 'danger' ? colors.danger : colors.idle)
        .getVariant({ a: () => 0.25 })
        .toCssValue()};
`

const Icon = styled(TriangleAlertIcon)<KindProp>`
  font-size: 20px;
  color: ${matchColor('kind', { danger: 'danger', warning: 'idle' })};
`

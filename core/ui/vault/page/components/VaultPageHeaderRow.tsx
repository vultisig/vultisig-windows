import { horizontalPadding } from '@lib/ui/css/horizontalPadding'
import { verticalPadding } from '@lib/ui/css/verticalPadding'
import { HStack } from '@lib/ui/layout/Stack'
import { pageConfig } from '@lib/ui/page/config'
import { ReactNode } from 'react'
import styled from 'styled-components'

const Container = styled.div`
  ${horizontalPadding(pageConfig.horizontalPadding)};
  ${verticalPadding(pageConfig.verticalPadding)};
  align-items: center;
  column-gap: 12px;
  display: grid;
  grid-template-columns: 1fr minmax(0, auto) 1fr;
  min-height: 60px;
  position: relative;
`

const PrimarySlot = styled(HStack)`
  justify-self: start;
`

const TitleSlot = styled.div`
  justify-self: center;
  min-width: 0;
  max-width: 100%;
`

const SecondarySlot = styled(HStack)`
  justify-self: end;
`

type VaultPageHeaderRowProps = {
  primaryControls?: ReactNode
  secondaryControls?: ReactNode
  title: ReactNode
}

/**
 * Header row for the vault page. Unlike the shared `PageHeader`, the control
 * groups take part in the layout instead of being absolutely positioned, so the
 * title column shrinks and ellipsizes rather than running under the controls at
 * narrow widths such as the extension side panel. Equal side columns keep the
 * title optically centered whenever it fits.
 */
export const VaultPageHeaderRow = ({
  primaryControls,
  secondaryControls,
  title,
}: VaultPageHeaderRowProps) => (
  <Container>
    <PrimarySlot alignItems="center" gap={8}>
      {primaryControls}
    </PrimarySlot>
    <TitleSlot>{title}</TitleSlot>
    <SecondarySlot alignItems="center" gap={8}>
      {secondaryControls}
    </SecondarySlot>
  </Container>
)

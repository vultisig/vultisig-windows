import { Button } from '@lib/ui/buttons/Button'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { AddressBookPageHeader } from '../../AddressBookSettingsPage.styles'
import {
  CenteredBox,
  Container,
  ResponsiveText,
} from './EmptyAddressView.styles'

type EmptyAddressesViewProps = {
  onOpenAddAddressView: () => void
}

const StyledIcon = styled(TriangleAlertIcon)`
  color: ${getColor('alertWarning')};
`

const EmptyAddressesView = ({
  onOpenAddAddressView,
}: EmptyAddressesViewProps) => {
  const { t } = useTranslation()

  return (
    <>
      <AddressBookPageHeader
        data-testid="EmptyAddressesView-AddressBookPageHeader"
        primaryControls={<PageHeaderBackButton />}
        title={
          <PageHeaderTitle>{t('vault_settings_address_book')}</PageHeaderTitle>
        }
      />
      <Container>
        <CenteredBox>
          <StyledIcon width={120} height={120} />
          <ResponsiveText weight={700} color="contrast">
            {t('vault_settings_address_book_no_addresses_title')}
          </ResponsiveText>
        </CenteredBox>
        <Button onClick={onOpenAddAddressView}>{t('add_address')}</Button>
      </Container>
    </>
  )
}

export default EmptyAddressesView

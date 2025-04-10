import { Button } from '@lib/ui/buttons/Button'
import { useTranslation } from 'react-i18next'

import { PageHeaderBackButton } from '../../../../../ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '../../../../../ui/page/PageHeaderTitle'
import { AddressBookPageHeader } from '../../AddressSelector.styles'
import {
  CenteredBox,
  Container,
  ResponsiveImage,
  ResponsiveText,
} from './EmptyAddressView.styles'

type EmptyAddressesViewProps = {
  onOpenAddAddressView: () => void
}

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
          <ResponsiveImage
            src="/assets/images/warningYellow.svg"
            alt="warning"
            width={120}
            height={120}
          />
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

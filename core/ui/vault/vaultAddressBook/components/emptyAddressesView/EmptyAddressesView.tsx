import { Button } from '@lib/ui/buttons/Button'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { Text } from '@lib/ui/text'
import { GradientText } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useCoreNavigate } from '../../../../navigation/hooks/useCoreNavigate'
import { AddressBookPageHeader } from '../../AddressBookSettingsPage.styles'
import { CenteredBox, Container } from './EmptyAddressView.styles'

const EmptyAddressesView = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const handleAddAddress = () => {
    navigate({ id: 'addAddress', state: {} })
  }

  return (
    <>
      <AddressBookPageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{t('address_book')}</PageHeaderTitle>}
      />
      <Container>
        <CenteredBox>
          <Text size={16} color="contrast" weight="600">
            {t('address_book_empty')}
          </Text>
          <Text size={14} color="light" weight="600" centerHorizontally>
            {t('address_book_empty_instruction')}
          </Text>
          <Button onClick={handleAddAddress} kind="outlined">
            <GradientText>{t('add_address')}</GradientText>
          </Button>
        </CenteredBox>
      </Container>
    </>
  )
}

export default EmptyAddressesView

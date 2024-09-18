import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { VStack } from '../../../lib/ui/layout/Stack';
import { Text } from '../../../lib/ui/text';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { PageSlice } from '../../../ui/page/PageSlice';
import { faqData } from './constants';
import { FaqButton, HorizontalLine } from './FaqVaultPage.styles';

type RowsOpenState = {
  [key: number]: boolean;
};

const FaqVaultPage = () => {
  const { t } = useTranslation();

  const [rowsOpen, setRowsOpen] = useState<RowsOpenState>(
    faqData.reduce<RowsOpenState>((acc, { id }) => {
      acc[id] = false;
      return acc;
    }, {})
  );

  const toggleRow = (id: number) => {
    setRowsOpen(prevState => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  return (
    <VStack flexGrow gap={16}>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={
          <PageHeaderTitle>
            {t('vault_rename_page_header_title')}
          </PageHeaderTitle>
        }
      />
      <PageSlice gap={16} flexGrow={true}>
        {faqData.map(({ id, title, content }) => (
          <FaqButton key={id} onClick={() => toggleRow(id)}>
            <Text size={16} color="contrast" weight="600">
              {t(title)}
            </Text>
            {rowsOpen[id] === true && (
              <>
                <HorizontalLine />
                <Text size={13} color="regular">
                  {t(content)}
                </Text>
              </>
            )}
          </FaqButton>
        ))}
      </PageSlice>
    </VStack>
  );
};

export default FaqVaultPage;

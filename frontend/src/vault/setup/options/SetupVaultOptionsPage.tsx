import { useTranslation } from 'react-i18next';

import { ElementSizeAware } from '../../../lib/ui/base/ElementSizeAware';
import { VStack } from '../../../lib/ui/layout/Stack';
import { StackSeparatedBy } from '../../../lib/ui/layout/StackSeparatedBy';
import { Text } from '../../../lib/ui/text';
import { makeAppPath } from '../../../navigation';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { setupOptionsConfig } from './config';
import { SetupVaultOption, SetupVaultOptionProps } from './SetupVaultOption';

export const SetupVaultOptionsPage = () => {
  const { t } = useTranslation();

  const options: SetupVaultOptionProps[] = [
    {
      artSrc: '/assets/icons/initiate.svg',
      title: t('initiating_device'),
      actionName: t('create_qr'),
      targetDestination: makeAppPath('setupVaultInitiatingDevice'),
    },
    {
      artSrc: '/assets/icons/pair.svg',
      title: t('pairing_device'),
      actionName: t('scan_qr'),
      targetDestination: makeAppPath('uploadQr', {
        title: t('pair'),
      }),
    },
  ];

  return (
    <VStack flexGrow>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{t('setup')}</PageHeaderTitle>}
      />
      <ElementSizeAware
        render={({ setElement, size }) => (
          <PageContent
            ref={setElement}
            alignItems="center"
            justifyContent="center"
          >
            <StackSeparatedBy
              direction={
                size &&
                size.width > setupOptionsConfig.optionWidth * options.length
                  ? 'row'
                  : 'column'
              }
              separator={
                <Text weight="700" color="contrast">
                  {t('or')}
                </Text>
              }
              gap={12}
              alignItems="center"
              justifyContent="center"
            >
              {options.map((option, index) => (
                <SetupVaultOption key={index} {...option} />
              ))}
            </StackSeparatedBy>
          </PageContent>
        )}
      />
    </VStack>
  );
};

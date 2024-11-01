import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { BrowserOpenURL } from '../../../../wailsjs/runtime/runtime';
import useVersionCheck from '../../../lib/hooks/useVersionCheck';
import { Text } from '../../../lib/ui/text';
import { extractErrorMsg } from '../../../lib/utils/error/extractErrorMsg';
import { ProductLogo } from '../../../ui/logo/ProductLogo';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageSlice } from '../../../ui/page/PageSlice';
import { VULTISIG_GITHUB_RELEASES_LINK } from '../constants';
import {
  CenteredText,
  Content,
  DownloadButton,
  FixedWrapper,
} from './VaultCheckUpdatePage.styles';

const VaultCheckUpdatePage = () => {
  const { t } = useTranslation();
  const {
    localVersion,
    latestVersion,
    updateAvailable,
    localError,
    remoteError,
    isRemoteFetching,
  } = useVersionCheck();

  let content: ReactNode;

  if (localError) {
    content = t('vaultCheckUpdatePage.errorLoadingLocalVersion', {
      error: extractErrorMsg(localError),
    });
  }

  if (remoteError) {
    content = t('vaultCheckUpdatePage.errorFetchingLatestVersion', {
      error: extractErrorMsg(remoteError),
    });
  }

  if (isRemoteFetching) {
    content = t('vaultCheckUpdatePage.fetchingLatestVersion');
  }

  if (!updateAvailable) {
    content = t('vaultCheckUpdatePage.applicationUpToDate');
  }

  if (updateAvailable) {
    content = (
      <CenteredText>
        {t('vaultCheckUpdatePage.newVersionAvailable', { latestVersion })}
        <DownloadButton
          onClick={() => BrowserOpenURL(VULTISIG_GITHUB_RELEASES_LINK)}
        >
          {t('vaultCheckUpdatePage.downloadButton')}
        </DownloadButton>
      </CenteredText>
    );
  }

  return (
    <PageSlice>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('vaultCheckUpdatePage.title')}
      />

      <FixedWrapper>
        <ProductLogo fontSize={200} />
        <Content>
          <Text color="contrast" weight={500}>
            {content}
          </Text>
          {!updateAvailable && (
            <Text color="contrast" size={14}>
              {localVersion}
            </Text>
          )}
        </Content>
      </FixedWrapper>
    </PageSlice>
  );
};

export default VaultCheckUpdatePage;

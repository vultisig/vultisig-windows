import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { BrowserOpenURL } from '../../../wailsjs/runtime/runtime';
import { Button } from '../../lib/ui/buttons/Button';
import { UniformColumnGrid } from '../../lib/ui/css/uniformColumnGrid';
import { FilledAlertIcon } from '../../lib/ui/icons/FilledAlertIcon';
import { VStack } from '../../lib/ui/layout/Stack';
import { Text, text } from '../../lib/ui/text';
import { extractErrorMsg } from '../../lib/utils/error/extractErrorMsg';
import { makeAppPath } from '../../navigation';
import { PageContent } from '../../ui/page/PageContent';
import { PageHeader } from '../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../ui/page/PageHeaderTitle';
import { ErrorState } from './ErrorBoundary';

const reportErrorUrl =
  'https://discord.com/channels/1203844257220395078/1294500829482450944';

const StackTrace = styled.pre`
  ${text({
    family: 'mono',
    size: 12,
    weight: '400',
  })}
`;

export const FullSizeErrorFallback = ({ error, info }: ErrorState) => {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{t('something_went_wrong')}</PageHeaderTitle>}
      />
      <PageContent gap={20}>
        <VStack
          scrollable
          flexGrow
          gap={40}
          alignItems="center"
          justifyContent="center"
        >
          <FilledAlertIcon style={{ fontSize: 66 }} />
          <VStack style={{ maxWidth: 320 }} alignItems="center" gap={8}>
            <Text
              family="mono"
              weight="700"
              size={16}
              color="contrast"
              centerHorizontally
            >
              {extractErrorMsg(error)}
            </Text>
            {info && <StackTrace>{info.componentStack}</StackTrace>}
          </VStack>
        </VStack>
        <UniformColumnGrid gap={20}>
          <Button
            onClick={() => {
              BrowserOpenURL(reportErrorUrl);
            }}
            kind="outlined"
          >
            {t('report_error')}
          </Button>
          <Link to={makeAppPath('vault')}>
            <Button as="div">{t('go_to_home_page')}</Button>
          </Link>
        </UniformColumnGrid>
      </PageContent>
    </>
  );
};

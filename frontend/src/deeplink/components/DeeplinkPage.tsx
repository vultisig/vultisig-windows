import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '../../lib/ui/buttons/Button';
import { QueryDependant } from '../../lib/ui/query/components/QueryDependant';
import { useAppPathState } from '../../navigation/hooks/useAppPathState';
import { useNavigateBack } from '../../navigation/hooks/useNavigationBack';
import { FlowErrorPageContent } from '../../ui/flow/FlowErrorPageContent';
import { FlowPageHeader } from '../../ui/flow/FlowPageHeader';
import { FlowPendingPageContent } from '../../ui/flow/FlowPendingPageContent';
import { PageContent } from '../../ui/page/PageContent';
import { useProcessDeeplinkMutation } from '../mutations/useProcessDeeplinkMutation';

export const DeeplinkPage = () => {
  const { t } = useTranslation();

  const { url } = useAppPathState<'deeplink'>();

  const { mutate, ...mutationState } = useProcessDeeplinkMutation();

  useEffect(() => mutate(url), [url, mutate]);

  const goBack = useNavigateBack();

  return (
    <>
      <FlowPageHeader title={t('deeplink')} />
      <PageContent flexGrow alignItems="center" justifyContent="center">
        <QueryDependant
          query={mutationState}
          success={() => null}
          pending={() => <FlowPendingPageContent title={t('processing_url')} />}
          error={() => (
            <FlowErrorPageContent
              action={<Button onClick={goBack}>{t('back')}</Button>}
              message={t('failed_to_process_url')}
            />
          )}
        />
      </PageContent>
    </>
  );
};

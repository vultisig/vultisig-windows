import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '../../lib/ui/buttons/Button';
import { MatchQuery } from '../../lib/ui/query/components/MatchQuery';
import { extractErrorMsg } from '../../lib/utils/error/extractErrorMsg';
import { useAppPathState } from '../../navigation/hooks/useAppPathState';
import { useNavigateBack } from '../../navigation/hooks/useNavigationBack';
import { FlowErrorPageContent } from '../../ui/flow/FlowErrorPageContent';
import { FlowPageHeader } from '../../ui/flow/FlowPageHeader';
import { FlowPendingPageContent } from '../../ui/flow/FlowPendingPageContent';
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
      <MatchQuery
        value={mutationState}
        success={() => null}
        pending={() => <FlowPendingPageContent title={t('processing_url')} />}
        error={error => (
          <FlowErrorPageContent
            action={<Button onClick={goBack}>{t('back')}</Button>}
            title={t('failed_to_process_url')}
            message={extractErrorMsg(error)}
          />
        )}
      />
    </>
  );
};

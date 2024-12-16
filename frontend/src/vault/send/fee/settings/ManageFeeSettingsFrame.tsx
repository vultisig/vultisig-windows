import { t } from 'i18next';

import { Opener } from '../../../../lib/ui/base/Opener';
import { SettingsIcon } from '../../../../lib/ui/icons/SettingsIcon';
import { ClosableComponentProps } from '../../../../lib/ui/props';
import { MatchQuery } from '../../../../lib/ui/query/components/MatchQuery';
import { FailedQueryOverlay } from '../../../../lib/ui/query/components/overlay/FailedQueryOverlay';
import { PendingQueryOverlay } from '../../../../lib/ui/query/components/overlay/PendingQueryOverlay';
import { PageHeaderIconButton } from '../../../../ui/page/PageHeaderIconButton';
import { StrictText } from '../../../deposit/DepositVerify/DepositVerify.styled';
import { useSpecificSendTxInfoQuery } from '../../queries/useSpecificSendTxInfoQuery';
import { SpecificSendTxInfoProvider } from '../SendSpecificTxInfoProvider';

type ManageFeeSettingsFrameProps = {
  render: (props: ClosableComponentProps) => React.ReactNode;
};

export const ManageFeeSettingsFrame = ({
  render,
}: ManageFeeSettingsFrameProps) => {
  const txSpecificInfoQuery = useSpecificSendTxInfoQuery();

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <PageHeaderIconButton onClick={onOpen} icon={<SettingsIcon />} />
      )}
      renderContent={({ onClose }) => (
        <MatchQuery
          value={txSpecificInfoQuery}
          success={value => (
            <SpecificSendTxInfoProvider value={value}>
              {render({ onClose })}
            </SpecificSendTxInfoProvider>
          )}
          pending={() => (
            <PendingQueryOverlay
              onClose={onClose}
              title={<StrictText>{t('loading')}</StrictText>}
            />
          )}
          error={() => (
            <FailedQueryOverlay
              title={<StrictText>{t('failed_to_load')}</StrictText>}
              onClose={onClose}
              closeText={t('close')}
            />
          )}
        />
      )}
    />
  );
};

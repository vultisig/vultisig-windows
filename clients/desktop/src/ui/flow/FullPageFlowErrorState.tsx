import { ActionProp, MessageProp, TitleProp } from '../../lib/ui/props';
import { PageHeader } from '../page/PageHeader';
import { PageHeaderBackButton } from '../page/PageHeaderBackButton';
import { PageHeaderTitle } from '../page/PageHeaderTitle';
import { FlowErrorPageContent } from './FlowErrorPageContent';

type FullPageFlowErrorStateProps = TitleProp &
  Partial<ActionProp> &
  MessageProp & {
    errorMessage?: string;
  };

export const FullPageFlowErrorState = ({
  title,
  action,
  message,
  errorMessage,
}: FullPageFlowErrorStateProps) => {
  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{title}</PageHeaderTitle>}
      />
      <FlowErrorPageContent
        action={action}
        title={message}
        message={errorMessage}
      />
    </>
  );
};

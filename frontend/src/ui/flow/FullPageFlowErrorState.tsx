import {
  ComponentWithActionProps,
  ComponentWithMessageProps,
  TitledComponentProps,
} from '../../lib/ui/props';
import { PageHeader } from '../page/PageHeader';
import { PageHeaderBackButton } from '../page/PageHeaderBackButton';
import { PageHeaderTitle } from '../page/PageHeaderTitle';
import { FlowErrorPageContent } from './FlowErrorPageContent';

export const FullPageFlowErrorState = ({
  title,
  action,
  message,
}: TitledComponentProps &
  Partial<ComponentWithActionProps> &
  ComponentWithMessageProps) => {
  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{title}</PageHeaderTitle>}
      />
      <FlowErrorPageContent action={action} title={message} />
    </>
  );
};
